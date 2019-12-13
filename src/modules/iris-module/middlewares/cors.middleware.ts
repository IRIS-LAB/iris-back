import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import cors from 'cors'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { IrisConfigOptions } from '../../config-module'

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {

  }

  public use(request: any, res: any, next: () => void): any {
    if(this.irisConfigOptions.enableCors) {
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-Total-Element', 'X-Total-Page', 'X-Page-Element-Count', 'Accept-Ranges', 'Content-Range', 'Link'],
        ...(this.irisConfigOptions.corsOptions || {}),
      })(request, res, next)
    } else {
      next()
    }
  }

}