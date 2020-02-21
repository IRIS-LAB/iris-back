import { Inject, Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import { ErrorDO, TechnicalException } from '@u-iris/iris-common'
import moment from 'moment-timezone'
import uuid from 'uuid'
import winston, { createLogger, format, transports } from 'winston'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { ExtendedLoggerOptions, IrisConfigOptions } from '../../config-module'
import { ClsService } from './cls.service'
import { ErrorService } from './error.service'

@Injectable()
export class LoggerService implements NestLoggerService {
  protected winstonLogger: winston.Logger
  private options: ExtendedLoggerOptions

  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions, private readonly errorService: ErrorService, private readonly clsService: ClsService) {
    if (!this.irisConfigOptions || !this.irisConfigOptions.logger) {
      throw this.errorService.createTechnicalException('logger', 'configuration.required', new Error())
    }
    this.options = this.irisConfigOptions.logger
    this.winstonLogger = this.createLogger()
    this.buildLogFormatter()
  }

  public get logger() {
    return this.winstonLogger
  }

  public debug(message: string) {
    this.logger.debug(message)
  }

  public info(message: string) {
    this.logger.info(message)
  }

  public warn(message: string) {
    this.logger.warn(message)
  }

  public error(message: string) {
    this.logger.error(message)
  }

  public log(message: any): any {
    this.logger.debug(message)
  }

  public verbose(message: any): any {
    this.logger.verbose(message)
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

  private buildLogFormatter() {
    this.logger.format = this.getLogFormatter()
  }

  private getLogFormatter() {
    const localTimeZone = 'Europe/Paris'
    const { splat, combine } = format
    const exportZipkin = false

    const appendTimestamp = format((info, opts) => {
      if (opts.tz) {
        info.timestamp = moment()
          .tz(opts.tz)
          .format()
      }
      return info
    })

    const myFormat = winston.format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [thread${process.pid}] [${this.options.appName}-${this.options.appVersion},${this.getTraceId()},${this.getSpanId()},${exportZipkin}] ${level.toUpperCase()} - ${message}`
    })
    return combine(appendTimestamp({ tz: localTimeZone }), splat(), myFormat)
  }

  private createLogger(): winston.Logger {

    // How to specify format per transport?
    const o = {
      console: {
        level: this.options.level,
        handleExceptions: true,
        humanReadableUnhandledException: true,
      },
    }

    // disable console if mode = production
    if (!this.options.enableConsole && !this.options.file) {
      throw new TechnicalException(new ErrorDO('logger.options', 'enableConsole.or.file.required', 'You must enable console or file logger'), new Error())
    }

    const loggerTransports: any[] = []
    if (this.options.enableConsole) {
      loggerTransports.push(new transports.Console(o.console))
    }
    if (this.options.file) {
      loggerTransports.push(new transports.File({ filename: this.options.file }))
    }
    return createLogger({
      level: this.options.level,
      format: this.getLogFormatter(),
      transports: loggerTransports,
      exitOnError: false, // do not exit on handled exceptions
    })
  }

  private generateRandomId(): string {
    return uuid.v4().replace(/-/g, '')
  }
}
