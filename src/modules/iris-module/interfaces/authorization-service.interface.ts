import { Request } from 'express'

export interface AuthorizationService {
  validateAuthorization(request: Request, ...functions: string[]): Promise<boolean>;
}
