import { IsString } from 'class-validator';

export class RevokeRefreshTokenDto {
  @IsString()
  refresh_token: string;
}
