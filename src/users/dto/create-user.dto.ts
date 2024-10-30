import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { Trim, Escape } from 'class-sanitizer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @Trim()
  @Escape()
  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  name: string;

  @IsEmail()
  @Trim()
  @Escape()
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'StrongPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @Escape()
  password: string;

  @ApiPropertyOptional({
    description: 'Access level of the user',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  access_level?: string;
}
