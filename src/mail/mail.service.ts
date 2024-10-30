import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendInvitation(
    email: string,
    OrganizationName: string,
    inviteLink: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: "You've Been Invited to Join Organization",
      html: `
        <h1>Join Our Organization</h1>
        <p>${OrganizationName} has invited you to join Organization!</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        <p>This invitation link will expire in 48 hours.</p>
      `,
    });
  }

  async sendNewUserPassword(email: string, password: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Account Password for Organization',
      html: `
        <h1>Welcome to Our Organization</h1>
        <p>Your account has been created. Use the password below to log in:</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>For security, please change this password after your first login.</p>
      `,
    });
  }
}
