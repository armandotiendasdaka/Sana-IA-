import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload, ValidatedUser } from './interfaces';
import { LoginResponseDto } from './dto/login-response.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    // Cache config values to avoid repeated reads
    private readonly refreshSecret: string;
    private readonly refreshExpiration: string;

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
    ) {
        this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';
        this.refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    }

    // ==================== Public Methods ====================

    async validateUser(email: string, password: string): Promise<ValidatedUser | null> {
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

    async validateLogin(email: string, password: string): Promise<LoginResponseDto> {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        return this.login(user);
    }

    async login(user: ValidatedUser): Promise<LoginResponseDto> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role?.name || 'user',
        };

        const refreshToken = this.generateRefreshToken(payload);
        await this.saveRefreshToken(refreshToken, user.id);

        this.logger.log(`User ${user.email} logged in successfully`);

        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name || 'user',
            },
        };
    }

    async refresh(refreshToken: string): Promise<LoginResponseDto> {
        const payload = this.verifyRefreshToken(refreshToken);
        const matchingToken = await this.findAndValidateStoredToken(refreshToken, payload.sub);

        // Refresh Rotation: Revoke used token
        await this.revokeToken(matchingToken);

        // Fetch user with role and issue new tokens
        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return this.login(user as ValidatedUser);
    }

    async logout(refreshToken: string): Promise<void> {
        try {
            const payload = this.jwtService.decode(refreshToken) as JwtPayload | null;
            if (!payload?.sub) return;

            const tokens = await this.getActiveTokensForUser(payload.sub);

            for (const tokenEntity of tokens) {
                if (await bcrypt.compare(refreshToken, tokenEntity.token)) {
                    await this.revokeToken(tokenEntity);
                    break;
                }
            }
        } catch {
            // Silently ignore logout errors
        }
    }

    // ==================== Private Helper Methods ====================

    private generateRefreshToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload, {
            secret: this.refreshSecret,
            expiresIn: this.refreshExpiration,
        } as Parameters<typeof this.jwtService.sign>[1]);
    }

    private async saveRefreshToken(token: string, userId: number): Promise<void> {
        const hashedToken = await bcrypt.hash(token, 10);
        const expiresAt = this.parseExpirationToDate(this.refreshExpiration);

        await this.refreshTokenRepository.save({
            token: hashedToken,
            user: { id: userId } as Partial<User>,
            expiresAt,
        });
    }

    private verifyRefreshToken(token: string): JwtPayload {
        try {
            return this.jwtService.verify(token, { secret: this.refreshSecret });
        } catch {
            throw new UnauthorizedException('Token de refresco inválido');
        }
    }

    private async findAndValidateStoredToken(refreshToken: string, userId: number): Promise<RefreshToken> {
        const tokens = await this.getActiveTokensForUser(userId);

        for (const tokenEntity of tokens) {
            const isMatch = await bcrypt.compare(refreshToken, tokenEntity.token);
            if (isMatch) {
                if (tokenEntity.expiresAt < new Date()) {
                    throw new UnauthorizedException('Token de refresco expirado');
                }
                return tokenEntity;
            }
        }

        // No matching token found - potential reuse attack
        throw new UnauthorizedException('Token de refresco inválido o revocado');
    }

    private async getActiveTokensForUser(userId: number): Promise<RefreshToken[]> {
        return this.refreshTokenRepository.find({
            where: { user: { id: userId }, isRevoked: false },
        });
    }

    private async revokeToken(token: RefreshToken): Promise<void> {
        token.isRevoked = true;
        await this.refreshTokenRepository.save(token);
    }

    private parseExpirationToDate(expiration: string): Date {
        const date = new Date();

        if (expiration.endsWith('d')) {
            const days = parseInt(expiration.replace('d', ''), 10);
            date.setDate(date.getDate() + days);
        } else if (expiration.endsWith('h')) {
            const hours = parseInt(expiration.replace('h', ''), 10);
            date.setHours(date.getHours() + hours);
        } else if (expiration.endsWith('m')) {
            const minutes = parseInt(expiration.replace('m', ''), 10);
            date.setMinutes(date.getMinutes() + minutes);
        } else if (expiration.endsWith('s')) {
            const seconds = parseInt(expiration.replace('s', ''), 10);
            date.setSeconds(date.getSeconds() + seconds);
        }

        return date;
    }
}
