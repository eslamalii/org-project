import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token issued during signin',
    example: 'refresh.jwt.token',
  })
  @IsString()
  refresh_token: string;
}
