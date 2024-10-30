// read-organization.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadOrganizationDto {
  @IsString()
  @ApiProperty({
    description: 'Unique identifier of the organization',
    example: 'org_12345',
  })
  organization_id: string;
}
