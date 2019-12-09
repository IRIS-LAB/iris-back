import { Request } from 'express'
import { AuthenticatedUser } from './authenticated-user.interface'

export interface AuthenticationService {
  /**
   * Get an authenticated user from a request.
   * @param request - the request
   */
  getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | undefined>;
}
