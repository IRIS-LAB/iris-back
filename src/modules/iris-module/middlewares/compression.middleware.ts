import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import compression from 'compression'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { IrisConfigOptions } from '../../config-module'


@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {

  }

  public use(request: any, res: any, next: () => void): any {
    if (this.irisConfigOptions.enableCompression) {
      compression(this.irisConfigOptions.compressionOptions)(request, res, next)
    } else {
      next()
    }
  }

}