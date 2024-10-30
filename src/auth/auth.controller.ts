// src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RevokeRefreshTokenDto } from './dto/revoke-refresh-token.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user.
   * Accessible without authentication.
   *
   * @param createUserDto - Data Transfer Object containing user registration details.
   * @returns An object containing a success message.
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateUserDto })
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    await this.authService.signup(createUserDto);
    return { message: 'User registered successfully' };
  }

  /**
   * Authenticates a user and issues JWT tokens.
   * Accessible without authentication.
   *
   * @param loginDto - Data Transfer Object containing user login credentials.
   * @returns An object containing a success message and JWT tokens.
   */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user and issue JWT tokens' })
  @ApiResponse({
    status: 200,
    description: 'Signin successful.',
    schema: {
      example: {
        message: 'Signin successful',
        access_token: 'jwt_access_token',
        refresh_token: 'jwt_refresh_token',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: LoginDto })
  async signin(
    @Body() loginDto: LoginDto,
  ): Promise<{ message: string; access_token: string; refresh_token: string }> {
    const { email, password } = loginDto;
    const tokens = await this.authService.signin(email, password);
    return { message: 'Signin successful', ...tokens };
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * Accessible without authentication.
   *
   * @param refreshTokenDto - Data Transfer Object containing the refresh token.
   * @returns An object containing a success message and new JWT tokens.
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh the access token using a valid refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully.',
    schema: {
      example: {
        message: 'Token refreshed successfully',
        access_token: 'new_jwt_access_token',
        refresh_token: 'new_jwt_refresh_token',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid refresh token.' })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ message: string; access_token: string; refresh_token: string }> {
    const { refresh_token } = refreshTokenDto;
    const tokens = await this.authService.refreshToken(refresh_token);
    return { message: 'Token refreshed successfully', ...tokens };
  }

  /**
   * Revokes a refresh token, preventing its future use.
   * Accessible without authentication.
   *
   * @param revokeRefreshTokenDto - Data Transfer Object containing the refresh token to revoke.
   * @returns An object containing a success message.
   */
  @Post('revoke-refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Refresh token revoked successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid refresh token.' })
  @ApiBody({ type: RevokeRefreshTokenDto })
  async revokeRefreshToken(
    @Body() revokeRefreshTokenDto: RevokeRefreshTokenDto,
  ): Promise<{ message: string }> {
    const { refresh_token } = revokeRefreshTokenDto;
    await this.authService.revokeRefreshToken(refresh_token);
    return { message: 'Refresh token revoked successfully' };
  }
}
