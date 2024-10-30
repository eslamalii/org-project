import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Organization } from './schemas/organization.schema';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { RoleGuardFactory } from '../auth/guards/role.guard';
import { PublicRouteGuard } from '../auth/guards/public-route.guard';

@Controller('organization')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * Accept an invitation to join an organization.
   * Accessible by any user (authentication may be handled within the service).
   *
   * @param token - The invitation token received via email.
   * @returns An object containing a success message.
   */
  @Get('accept-invite')
  @UseGuards(PublicRouteGuard)
  @HttpCode(HttpStatus.OK)
  async acceptInvite(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    await this.organizationsService.acceptInvite(token);
    return { message: 'Invitation accepted and user added to organization' };
  }

  /**
   * Create a new organization.
   * Accessible only by authenticated users with 'admin' role.
   *
   * @param createOrganizationDto - Data Transfer Object containing organization details.
   * @param req - Request object containing authenticated user information.
   * @returns An object containing the newly created organization's ID.
   */
  @UseGuards(JwtAuthGuard, RoleGuardFactory('admin'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Request() req,
  ): Promise<{ organization_id: string }> {
    const userId = req.user.userId;
    const organizationId = await this.organizationsService.create(
      createOrganizationDto,
      userId,
    );
    return { organization_id: organizationId.organization_id };
  }

  /**
   * Retrieve a specific organization by its ID.
   * Accessible by any authenticated user.
   *
   * @param organization_id - The ID of the organization to retrieve.
   * @param req - Request object containing authenticated user information.
   * @returns The organization entity.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':organization_id')
  @HttpCode(HttpStatus.OK)
  async getOrganization(
    @Param('organization_id') organization_id: string,
    @Request() req,
  ): Promise<Organization> {
    const userId = req.user.userId;
    return this.organizationsService.findById(organization_id, userId);
  }

  /**
   * Retrieve all organizations accessible to the authenticated user.
   * Accessible by any authenticated user.
   *
   * @param req - Request object containing authenticated user information.
   * @returns An array of organization entities.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllOrganizations(@Request() req): Promise<Organization[]> {
    const userId = req.user.userId;
    return this.organizationsService.findAll(userId);
  }

  /**
   * Update an existing organization.
   * Accessible only by authenticated users with 'admin' role.
   *
   * @param organization_id - The ID of the organization to update.
   * @param updateOrganizationDto - Data Transfer Object containing updated organization details.
   * @param req - Request object containing authenticated user information.
   * @returns The updated organization entity.
   */
  @UseGuards(JwtAuthGuard, RoleGuardFactory('admin'))
  @Put(':organization_id')
  @HttpCode(HttpStatus.OK)
  async updateOrganization(
    @Param('organization_id') organization_id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Request() req,
  ): Promise<Organization> {
    const userId = req.user.userId;
    return this.organizationsService.update(
      organization_id,
      updateOrganizationDto,
      userId,
    );
  }

  /**
   * Delete an existing organization.
   * Accessible only by authenticated users with 'admin' role.
   *
   * @param organization_id - The ID of the organization to delete.
   * @param req - Request object containing authenticated user information.
   * @returns An object containing a success message.
   */
  @UseGuards(JwtAuthGuard, RoleGuardFactory('admin'))
  @Delete(':organization_id')
  @HttpCode(HttpStatus.OK)
  async deleteOrganization(
    @Param('organization_id') organization_id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.organizationsService.delete(organization_id, userId);
    return { message: 'Organization deleted successfully' };
  }

  /**
   * Invite a user to join an organization.
   * Accessible only by authenticated users with 'admin' role.
   *
   * @param organization_id - The ID of the organization to invite the user to.
   * @param inviteUserDto - Data Transfer Object containing the email of the user to invite.
   * @param req - Request object containing authenticated user information.
   * @returns An object containing a success message.
   */
  @UseGuards(JwtAuthGuard, RoleGuardFactory('admin'))
  @Get(':organization_id/invite')
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(
    @Param('organization_id') organization_id: string,
    @Body() inviteUserDto: InviteUserDto,
    @Request() req,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    const { user_email } = inviteUserDto;
    await this.organizationsService.inviteUser(
      organization_id,
      user_email,
      userId,
    );
    return { message: 'Invitation sent successfully' };
  }
}
