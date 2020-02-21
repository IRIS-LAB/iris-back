import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AuthenticatedUser, AuthenticationService } from '../interfaces'

@Injectable()
export class DefaultAuthenticationService implements AuthenticationService {
  public async getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | undefined> {
    return undefined
  }

}
