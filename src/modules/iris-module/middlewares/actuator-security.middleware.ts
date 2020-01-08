import { Inject, NestMiddleware } from '@nestjs/common'
import { IRIS_CONFIG_OPTIONS, ROLES_METADATAS } from '../../../constants'
import { IrisConfigOptions } from '../../config-module'

export class ActuatorSecurityMiddleware implements NestMiddleware{
  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {
  }
  public use(request: any, res: any, next: () => void): any {
    if(this.irisConfigOptions.actuatorOptions!.role) {
      if (!request[ROLES_METADATAS]) {
        request[ROLES_METADATAS] = []
      }
      request[ROLES_METADATAS].push(this.irisConfigOptions.actuatorOptions!.role)
    }
    next()
  }

}