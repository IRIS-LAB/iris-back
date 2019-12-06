import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { APP_AUTHORIZATION_SERVICE, ROLES_METADATAS } from '../../../constants'
import { AuthorizationService } from '../interfaces'

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private readonly reflector: Reflector, @Inject(APP_AUTHORIZATION_SERVICE) private readonly authorizationService: AuthorizationService) {
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const functions = this.reflector.get<string[]>(ROLES_METADATAS, context.getHandler())
    if (!functions || !functions.length) {
      return true
    }
    const request = context.switchToHttp().getRequest()

    return this.authorizationService.validateAuthorization(request, ...functions)
  }

}
