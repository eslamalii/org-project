import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service'; // Assuming you have a Redis service
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<{ message: string }> {
    await this.usersService.create({ ...createUserDto, access_level: 'admin' });
    return { message: 'User registered successfully' };
  }

  async signin(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.validateUser(email, password);
    const payload = {
      id: user._id,
      email: user.email,
      access_level: user.access_level,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Store refresh token in Redis
    await this.redisService.set(
      refresh_token,
      user._id.toString(),
      7 * 24 * 60 * 60,
    ); // 7 days

    return { access_token, refresh_token };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token exists in Redis
      const storedUserId = await this.redisService.get(refreshToken);
      if (!storedUserId || storedUserId !== payload.id) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        id: user._id,
        email: user.email,
        access_level: user.access_level,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      });

      // Store new refresh token and delete the old one
      await this.redisService.set(
        newRefreshToken,
        user._id.toString(),
        7 * 24 * 60 * 60,
      );
      await this.redisService.del(refreshToken);

      return { access_token: newAccessToken, refresh_token: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<{ message: string }> {
    const deleted = await this.redisService.del(refreshToken);
    if (deleted === 0) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return { message: 'Refresh token revoked successfully' };
  }

  async validateUserByJwt(payload: JwtPayload) {
    const { email } = payload;
    const user = await this.usersService.findByEmail(email);
    if (user && user.email === email) {
      return user;
    }
    return null;
  }
}
