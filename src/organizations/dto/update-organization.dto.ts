// update-organization.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Updated name of the organization',
    example: 'OpenAI Updated',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Updated description of the organization',
    example: 'An advanced AI research organization.',
  })
  description?: string;
}
