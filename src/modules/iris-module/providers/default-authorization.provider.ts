import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AuthorizationService } from '../interfaces'
import { LoggerProvider } from './logger.provider'

@Injectable()
export class DefaultAuthorizationProvider implements AuthorizationService {
  constructor(private readonly logger: LoggerProvider) {
  }

  public async validateAuthorization(request: Request, ...functions: string[]): Promise<boolean> {
    this.logger.warn('You should implement your own AuthorizationService')
    return false
  }

}
