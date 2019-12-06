import { Request } from 'express'
import { AuthenticatedUser } from './authenticated-user.interface'

export interface AuthenticationService {
  getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | undefined>;
}
