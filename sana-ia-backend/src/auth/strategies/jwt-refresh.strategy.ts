import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        configService: ConfigService,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
            passReqToCallback: true, // Needed to validate against DB using the token string itself?
        });
    }

    async validate(req: any, payload: any) {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token malformed');
        }

        // Optional: Check DB existence here to fail fast at Guard level
        // But our Service handles rotation logic which creates a NEW token.
        // If we just check existence here, we are good.
        // BUT service does "Find, Check Revoked, Check Expired, Rotate".
        // If Strategy does "Find", then Service does "Find", it's 2 DB calls.
        // Optimization: Let Strategy pass payload. Service does the heavy lifting (transactional rotation).

        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role
        };
    }
}
