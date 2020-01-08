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

    let access = true

    const middlewaresFunctions = request[ROLES_METADATAS]
    access = access && (!middlewaresFunctions || middlewaresFunctions.length === 0 || await this.authorizationService.validateAuthorization(request, ...middlewaresFunctions))

    const guardsClassRoles = this.reflector.get<string[]>(ROLES_METADATAS, context.getClass())
    access = access && (!guardsClassRoles || guardsClassRoles.length === 0 || await this.authorizationService.validateAuthorization(request, ...guardsClassRoles))

    const guardsMethodRoles = this.reflector.get<string[]>(ROLES_METADATAS, context.getHandler())
    access = access && (!guardsMethodRoles || guardsMethodRoles.length === 0 || await this.authorizationService.validateAuthorization(request, ...guardsMethodRoles))

    return access
  }

}
