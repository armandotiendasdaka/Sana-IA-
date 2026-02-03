import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            this.logger.warn(`Login failed: User with email ${email} not found`);
            return null;
        }

        if (!user.isActive) {
            this.logger.warn(`Login failed: User ${email} is inactive`);
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            this.logger.warn(`Login failed: Invalid password for ${email}`);
            return null;
        }

        const { password: _, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role?.name || 'user',
        };

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
            expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as any,
        });

        // Store refresh token in DB
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        const expirationTime = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

        // Calculate expiration date
        const expirationDate = new Date();
        if (expirationTime.endsWith('d')) {
            const days = parseInt(expirationTime.replace('d', ''));
            expirationDate.setDate(expirationDate.getDate() + days);
        } else if (expirationTime.endsWith('s')) {
            const seconds = parseInt(expirationTime.replace('s', ''));
            expirationDate.setSeconds(expirationDate.getSeconds() + seconds);
        }

        await this.refreshTokenRepository.save({
            token: hashedRefreshToken,
            user: { id: user.id } as any,
            expiresAt: expirationDate,
        });

        this.logger.log(`User ${user.email} logged in successfully`);

        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name,
            },
        };
    }

    async validateLogin(email: string, password: string) {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        return this.login(user);
    }

    async refresh(refreshToken: string) {
        try {
            // Validate signature
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
            });

            // Check if user still exists
            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                throw new UnauthorizedException('Usuario no encontrado');
            }

            // Verify if token exists in DB and matches
            const tokens: RefreshToken[] = await this.refreshTokenRepository.find({
                where: { user: { id: user.id }, isRevoked: false },
            });

            let matchingToken: RefreshToken | null = null;
            for (const tokenEntity of tokens) {
                const isMatch = await bcrypt.compare(refreshToken, tokenEntity.token);
                if (isMatch) {
                    matchingToken = tokenEntity;
                    break;
                }
            }

            if (!matchingToken) {
                // Potential reuse detected! Revoke all tokens for this user?
                // For now just deny
                throw new UnauthorizedException('Token de refresco inválido o revocado');
            }

            if (matchingToken.expiresAt < new Date()) {
                throw new UnauthorizedException('Token de refresco expirado');
            }

            // Refresh Rotation: Revoke used token, issue new one
            matchingToken.isRevoked = true;
            await this.refreshTokenRepository.save(matchingToken);

            // Generate new pair (equivalent to login logic)
            // But we can simplify to just return new access token + new refresh token
            // calling login(user) again is easiest way to get full pair

            // We need 'role' object for login method
            const userForLogin = {
                ...user,
                role: user.role // assume user has role loaded
            };

            // To ensure role is loaded, findOne normally fetches eager relations? 
            // UsersService.findOne doesn't seem to relations currently based on previous views.
            // Let's assume payload has role info we can reuse or fetch properly.

            // Let's fetch role if missing
            if (!user.role) {
                // If service doesn't return role, we might need payload role
                // For safety, let's call login which re-generates tokens
                // Re-fetching full user with role would be better but let's trust payload or simple login
            }

            // Actually, UsersService.findByEmail had relations: ['role'], findOne might not.
            // Let's fetch the user with role using findByEmail (since we have email from payload)
            const fullUser = await this.usersService.findByEmail(payload.email);
            if (!fullUser) throw new UnauthorizedException('User not found');

            return this.login(fullUser);

        } catch (e) {
            throw new UnauthorizedException('Token de refresco inválido');
        }
    }

    async logout(refreshToken: string) {
        try {
            // Find matching token and revoke
            // We need to iterate/compare hashes again or decode to find user first
            const payload = this.jwtService.decode(refreshToken) as any;
            if (!payload || !payload.sub) return;

            const tokens: RefreshToken[] = await this.refreshTokenRepository.find({
                where: { user: { id: payload.sub }, isRevoked: false },
            });

            for (const tokenEntity of tokens) {
                if (await bcrypt.compare(refreshToken, tokenEntity.token)) {
                    tokenEntity.isRevoked = true;
                    await this.refreshTokenRepository.save(tokenEntity);
                    break;
                }
            }
        } catch (e) {
            // Ignore errors on logout
        }
    }
}
