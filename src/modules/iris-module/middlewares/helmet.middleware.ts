import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import helmet from 'helmet'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { IrisConfigOptions } from '../../config-module'

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {

  }

  public use(request: any, res: any, next: () => void): any {
    if (this.irisConfigOptions.enableHelmet) {
      helmet(this.irisConfigOptions.helmetOptions)(request, res, next)
    } else {
      next()
    }
  }

}