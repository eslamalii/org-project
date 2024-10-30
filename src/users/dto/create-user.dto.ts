import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { Trim, Escape } from 'class-sanitizer';

export class CreateUserDto {
  @IsString()
  @Trim()
  @Escape()
  name: string;

  @IsEmail()
  @Trim()
  @Escape()
  email: string;

  @IsString()
  @MinLength(6)
  @Escape()
  password: string;

  @IsOptional()
  access_level?: string;
}
