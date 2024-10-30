export interface JwtPayload {
  id: string;
  email: string;
  access_level: string;
  iat?: number;
  exp?: number;
}
