import { Inject, Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import { ErrorDO, TechnicalException } from '@u-iris/iris-common'
import moment from 'moment-timezone'
import uuid from 'uuid'
import winston, { createLogger, format, LeveledLogMethod, LogMethod, transports } from 'winston'
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
          .format(this.irisConfigOptions.logger.dateFormat)
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
