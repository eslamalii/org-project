import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class PublicRouteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const route = request.route.path;

    // Check if the route matches public routes
    const publicRoutes = ['/organization/accept-invite'];
    return publicRoutes.includes(route);
  }
}
