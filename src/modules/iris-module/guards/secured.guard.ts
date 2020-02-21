import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  APP_AUTHENTICATION_SERVICE,
  APP_AUTHORIZATION_SERVICE,
  IRIS_CONFIG_OPTIONS,
  IRIS_DEFAULT_ROLE,
  SECURED_METADATAS,
  UNSECURED_METADATAS,
} from '../../../constants'
import { IrisConfigOptions } from '../../config-module'
import { AuthenticationService, AuthorizationService } from '../interfaces'
import { ClsService } from '../services'

@Injectable()
export class SecuredGuard implements CanActivate {

  constructor(@Inject(IRIS_CONFIG_OPTIONS) private readonly irisConfigOptions: IrisConfigOptions, private readonly reflector: Reflector, @Inject(APP_AUTHORIZATION_SERVICE) private readonly authorizationService: AuthorizationService, private readonly clsService: ClsService, @Inject(APP_AUTHENTICATION_SERVICE) private readonly authenticationService: AuthenticationService) {
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // get authenticated user from authentication provider
    const user = await this.authenticationService.getAuthenticatedUser(request)

    // save user into request object
    request.user = user

    // save user into cls context
    this.clsService.setAuthenticatedUser(user)

    // first check method guard
    const guardsMethodUnsecured = this.reflector.get<string[]>(UNSECURED_METADATAS, context.getHandler())
    if (guardsMethodUnsecured) {
      return true
    }
    const guardsMethodSecured = this.reflector.get<string[]>(SECURED_METADATAS, context.getHandler())
    if (guardsMethodSecured && guardsMethodSecured.length) {
      return this.authorizationService.validateAuthorization(request, ...guardsMethodSecured)
    }

    // then check class guard
    const guardsClassUnsecured = this.reflector.get<string[]>(UNSECURED_METADATAS, context.getClass())
    if (guardsClassUnsecured) {
      return true
    }
    const guardsClassSecured = this.reflector.get<string[]>(SECURED_METADATAS, context.getClass())
    if (guardsClassSecured && guardsClassSecured.length) {
      return this.authorizationService.validateAuthorization(request, ...guardsClassSecured)
    }

    // check middleware secured
    const middlewaresFunctions = request[SECURED_METADATAS]
    if (middlewaresFunctions && middlewaresFunctions.length) {
      return this.authorizationService.validateAuthorization(request, ...middlewaresFunctions)
    }

    // check global module configuration
    if (this.irisConfigOptions.secured === true) {
      return this.authorizationService.validateAuthorization(request, IRIS_DEFAULT_ROLE)
    } else if (typeof this.irisConfigOptions.secured === 'string') {
      return this.authorizationService.validateAuthorization(request, this.irisConfigOptions.secured)
    } else if (typeof this.irisConfigOptions.secured === 'object' && Array.isArray(this.irisConfigOptions.secured)) {
      return this.authorizationService.validateAuthorization(request, ...this.irisConfigOptions.secured)
    }
    return true
  }

}
