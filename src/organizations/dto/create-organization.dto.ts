import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the organization',
    example: 'OpenAI',
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Description of the organization',
    example: 'A leading AI research organization.',
  })
  description?: string;
}
