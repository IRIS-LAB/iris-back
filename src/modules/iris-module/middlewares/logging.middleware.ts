import { Injectable, NestMiddleware } from '@nestjs/common'
import URI from 'urijs'
import { LoggerService } from '../services'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

  constructor(private readonly loggerService: LoggerService) {
  }

  public use(req: any, res: any, next: () => void): any {
    this.loggerService.info(`verb=${req.method},uri=${new URI(req.url).pathname()},queryParams=${JSON.stringify(req.query)},ip=${req.ip}`)
    next()
    this.loggerService.info(`statusCode=${res.statusCode}`)
  }
}
