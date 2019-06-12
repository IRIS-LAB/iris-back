import { ErreurDO, TechnicalException } from '@u-iris/iris-common'
import moment from 'moment-timezone'
import { createLogger, format, Logger as WLogger, transports } from 'winston'

type LogLevel = 'debug' | 'warn' | 'info' | 'error'

export type ILogger = WLogger

export interface LoggerOptions {
  appName: string;
  appVersion: string;
  file?: string;
  enableConsole?: boolean;
}

/**
 * Object to create a logger
 */
class LoggerUtils {
  /**
   * Create a new Logger
   * @param {String} logLevel (debug, info, error)
   * @param {LoggerOptions} options - options for formatter
   * @returns Winston Object Logger
   * @throws TechnicalException if no file and console is enabled
   */
  public create(logLevel: LogLevel, options: LoggerOptions): WLogger {
    const localTimeZone = 'Europe/Paris'
    const { splat, combine, printf, colorize } = format

    // TODO : implement zipkin
    const traceId = ''
    const spanId = ''
    const exportZipkin = false

    const myFormat = printf(({ timestamp, level, message }) => {
      return `${timestamp} [thread${process.pid}] [${options.appName}-${options.appVersion},${traceId},${spanId},${exportZipkin}] ${level.toUpperCase()} ${message}`
    })

    const appendTimestamp = format((info, opts) => {
      if (opts.tz) {
        info.timestamp = moment()
          .tz(opts.tz)
          .format()
      }
      return info
    })

    // How to specify format per transport?
    const o = {
      console: {
        level: logLevel,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        format: combine(colorize(), myFormat),
      },
    }

    // disable console if mode = production
    if (!options.enableConsole && !options.file) {
      throw new TechnicalException(new ErreurDO('logger.options', 'enableConsole.or.file.required', 'You must enable console or file logger'), new Error())
    }

    const loggerTransports = []
    if (options.enableConsole) {
      loggerTransports.push(new transports.Console(o.console))
    }
    if (options.file) {
      loggerTransports.push(new transports.File({ filename: options.file }))
    }
    return createLogger({
      level: logLevel,
      format: combine(appendTimestamp({ tz: localTimeZone }), splat(), myFormat),
      transports: loggerTransports,
      exitOnError: false, // do not exit on handled exceptions
    })
  }

  /**
   * Create default logger with console output based on environment variables :
   * <ul>
   *   <li>APP_NAME: name of the application</li>
   *   <li>APP_VERSION: version of the application</li>
   * </ul>
   */
  public createDefault() {
    return this.create(process.env.LOG_LEVEL as LogLevel || 'debug', {
      appName: process.env.APP_NAME || 'unknown-application',
      appVersion: process.env.APP_VERSION || '?.?.?',
      file: process.env.LOG_FILE,
      enableConsole: true,
    })
  }
}

export const Logger = new LoggerUtils()
