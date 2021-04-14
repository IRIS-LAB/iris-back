import { Inject, Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import uuid from 'uuid'
import winston, { LeveledLogMethod, LogMethod } from 'winston'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { LoggerUtils } from '../../../utils'
import { IrisConfigOptions } from '../../config-module'
import { ClsService } from './cls.service'
import { ErrorService } from './error.service'

@Injectable()
export class LoggerService implements NestLoggerService {
  protected winstonLogger: winston.Logger

  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions, private readonly errorService: ErrorService, private readonly clsService: ClsService) {
    if (!this.irisConfigOptions || !this.irisConfigOptions.logger) {
      throw this.errorService.createTechnicalException('logger', 'configuration.required', new Error())
    }
    this.winstonLogger = LoggerUtils.createWinstonLogger(this.irisConfigOptions.logger, this.getTraceId.bind(this), this.getSpanId.bind(this))
  }

  public get logger() {
    return this.winstonLogger
  }

  public debug: LeveledLogMethod = (...args: any []) => {
    // @ts-ignore
    return this.logger.debug.apply(this.logger, args)
  }

  public info: LeveledLogMethod = (...args: any []) => {
    // @ts-ignore
    return this.logger.info.apply(this.logger, args)
  }

  public warn: LeveledLogMethod = (...args: any []) => {
    // @ts-ignore
    return this.logger.warn(this.logger, args)
  }

  public error: LeveledLogMethod = (...args: any []) => {
    // @ts-ignore
    return this.logger.error(this.logger, args)
  }

  public verbose: LeveledLogMethod = (...args: any []) => {
    // @ts-ignore
    return this.logger.verbose(this.logger, args)
  }

  public log: LogMethod = (...args: any []) => {
    // @ts-ignore
    return this.logger.log.apply(this.logger, args)
  }

  public setTraceId(traceId: string) {
    this.clsService.setTraceId(traceId)
  }

  public getTraceId(): string {
    if (!this.clsService.active) {
      return '?'
    }
    return this.clsService.getTraceId() || this.clsService.setTraceId(this.generateRandomId())
  }

  private getSpanId(): string {
    if (!this.clsService.active) {
      return '?'
    }
    return this.clsService.getSpanId() || this.clsService.setSpanId(this.generateRandomId())
  }

  private generateRandomId(): string {
    return uuid.v4().replace(/-/g, '')
  }
}
