import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RevokeRefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token to be revoked',
    example: 'refresh.jwt.token',
  })
  @IsString()
  refresh_token: string;
}
