import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service'; // Ensure AuthService is correctly imported
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService, // To fetch user details
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Ensure the token hasn't expired
      secretOrKey: configService.get<string>('JWT_SECRET'), // Ensure you have JWT_SECRET in your config
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUserByJwt(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user; // This attaches the user object to the request
  }
}
