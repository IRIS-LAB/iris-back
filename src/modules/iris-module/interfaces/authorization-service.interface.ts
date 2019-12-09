import { Request } from 'express'

export interface AuthorizationService {
  /**
   * Validates that the authenticated user has access to one of the roles.
   * @param request - the request
   * @param roles - the roles
   */
  validateAuthorization(request: Request, ...roles: string[]): Promise<boolean>;
}
