import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly role: string) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user?.access_level !== 'user';
  }
}

export const RoleGuardFactory = (access_level: string) => {
  return new RoleGuard(access_level);
};
