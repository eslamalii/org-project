import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Organization,
  OrganizationDocument,
} from './schemas/organization.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    userId: string,
  ): Promise<{ organization_id: string }> {
    const { name, description } = createOrganizationDto;
    const existingOrg = await this.organizationModel.findOne({ name });
    if (existingOrg) {
      throw new ConflictException('Organization with this name already exists');
    }

    const organization = new this.organizationModel({
      name,
      description,
      organization_members: [new Types.ObjectId(userId)],
    });

    await organization.save();

    return { organization_id: organization.organization_id };
  }

  async findById(
    organization_id: string,
    userId: string,
  ): Promise<Organization> {
    const organization = await this.organizationModel
      .findOne({ organization_id })
      .populate({
        path: 'organization_members',
        select: 'name email access_level',
        model: 'User',
      })
      .exec();
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (
      !organization.organization_members.some(
        (member: any) => member._id.toString() === userId,
      )
    ) {
      throw new UnauthorizedException('Access denied');
    }

    return organization;
  }

  async findAll(userId: string): Promise<Organization[]> {
    return this.organizationModel
      .find({ organization_members: userId })
      .populate({
        path: 'organization_members',
        select: 'name email access_level -_id',
        model: 'User',
      })
      .exec();
  }

  async update(
    organization_id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userId: string,
  ): Promise<Organization> {
    const organization = await this.organizationModel
      .findOne({ organization_id })
      .exec();
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if the user is a member (or has admin rights)
    if (
      !organization.organization_members.some(
        (member) => member.toString() === userId,
      )
    ) {
      throw new UnauthorizedException('Access denied');
    }

    // Update fields
    if (updateOrganizationDto.name) {
      organization.name = updateOrganizationDto.name;
    }
    if (updateOrganizationDto.description) {
      organization.description = updateOrganizationDto.description;
    }

    await organization.save();
    return organization;
  }

  async delete(
    organization_id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const organization = await this.organizationModel
      .findOne({ organization_id })
      .exec();
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if the user is an admin or has deletion rights
    // For simplicity, assume the creator is the admin
    const isAdmin = organization.organization_members[0].toString() === userId;
    if (!isAdmin) {
      throw new UnauthorizedException(
        'Only admins can delete the organization',
      );
    }

    await this.organizationModel.deleteOne({ organization_id }).exec();
    return { message: 'Organization deleted successfully' };
  }

  async inviteUser(
    organization_id: string,
    userEmail: string,
    inviterId: string,
  ): Promise<{ message: string }> {
    const organization = await this.organizationModel
      .findOne({ organization_id })
      .exec();
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if inviter is a member
    if (
      !organization.organization_members.some(
        (member) => member.toString() === inviterId,
      )
    ) {
      throw new UnauthorizedException('Access denied');
    }

    // Check if user already exists
    const user = await this.usersService.findByEmail(userEmail);
    if (
      user &&
      organization.organization_members.some((user) => user.equals(user._id))
    ) {
      throw new ConflictException(
        'User is already a member of the organization',
      );
    }

    // Generate an invitation token or link
    const invitationToken = this.jwtService.sign(
      { id: organization_id, email: userEmail },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1d',
      },
    );

    const invitationLink = `http://localhost:8080/organization/accept-invite?token=${invitationToken}`;

    await this.mailService.sendInvitation(
      userEmail,
      organization.name,
      invitationLink,
    );

    return { message: 'Invitation sent successfully' };
  }

  generateRandomPassword(length = 12): string {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }

  async acceptInvite(token: string): Promise<{ message: string }> {
    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const { id, email } = payload;
      let user: UserDocument | null =
        await this.usersService.findByEmail(email);
      let generatedPassword: string | null = null;

      if (!user) {
        generatedPassword = this.generateRandomPassword();

        user = (await this.usersService.create({
          email,
          password: generatedPassword,
          name: 'Test User',
          access_level: 'user',
        })) as UserDocument;

        await this.mailService.sendNewUserPassword(email, generatedPassword);
      }

      const organization = await this.organizationModel
        .findOne({ organization_id: id })
        .exec();

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      if (
        organization.organization_members.some(
          (member: Types.ObjectId) => member.toString() === user._id.toString(),
        )
      ) {
        throw new ConflictException('User is already a member');
      }

      organization.organization_members.push(user._id);
      await organization.save();

      return { message: 'Invitation accepted and user added to organization' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired invitation token');
    }
  }
}
