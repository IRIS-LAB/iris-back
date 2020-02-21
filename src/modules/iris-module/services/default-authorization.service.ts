import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AuthorizationService } from '../interfaces'
import { LoggerService } from './logger.service'

@Injectable()
export class DefaultAuthorizationService implements AuthorizationService {
  constructor(private readonly loggerService: LoggerService) {
  }

  public async validateAuthorization(request: Request, ...functions: string[]): Promise<boolean> {
    this.loggerService.warn('You should implement your own AuthorizationService')
    return false
  }

}
