import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import express from 'express'
import eActuator from 'express-actuator'
import { getConnectionManager } from 'typeorm'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { IrisConfigOptions } from '../../config-module'

@Injectable()
export class ActuatorMiddleware implements NestMiddleware {
  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {
  }

  public use(request: any, response: any, nextHandler: () => void): any {

    if (this.irisConfigOptions.actuatorOptions && this.irisConfigOptions.actuatorOptions.enable) {
      const router = express.Router()
      router.get('/health', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let up: boolean = true

        try {
          const connections = getConnectionManager().connections
          up = up && connections.reduce((isConnected: boolean, connec) => isConnected && connec.isConnected, true)
        } catch (e) {
          // nothing
        }
        res.json({ status: up ? 'UP' : 'DOWN' })
      })
      router.use(eActuator())
      // @ts-ignore
      router.handle(request, response, nextHandler)
    }
  }

}