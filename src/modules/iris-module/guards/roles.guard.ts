import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { APP_AUTHENTICATION_SERVICE, APP_AUTHORIZATION_SERVICE, ROLES_METADATAS } from '../../../constants'
import { AuthenticationService, AuthorizationService } from '../interfaces'
import { ClsProvider } from '../providers'

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private readonly reflector: Reflector, @Inject(APP_AUTHORIZATION_SERVICE) private readonly authorizationService: AuthorizationService, private readonly clsManager: ClsProvider, @Inject(APP_AUTHENTICATION_SERVICE) private readonly authenticationProvider: AuthenticationService) {
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // get authenticated user from authentication provider
    const user = await this.authenticationProvider.getAuthenticatedUser(request)

    // save user into request object
    request.user = user

    // save user into cls context
    this.clsManager.setAuthenticatedUser(user)

    const functions = this.reflector.get<string[]>(ROLES_METADATAS, context.getHandler())
    if (!functions || !functions.length) {
      return true
    }
    // if any role is required, process to authorization validation
    return this.authorizationService.validateAuthorization(request, ...functions)
  }

}
