// invite-user.dto.ts
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @IsEmail()
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'invitee@example.com',
  })
  user_email: string;
}
