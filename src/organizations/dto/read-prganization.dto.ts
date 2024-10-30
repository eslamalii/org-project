import { IsString } from 'class-validator';

export class ReadOrganizationDto {
  @IsString()
  organization_id: string;
}
