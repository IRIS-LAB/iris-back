import { ErrorDO, TechnicalException } from '@u-iris/iris-common'
import moment from 'moment-timezone'
import winston, { format, transports } from 'winston'
import { ExtendedLoggerOptions } from '../modules'

export class LoggerUtils {
  static createWinstonLogger(options: ExtendedLoggerOptions, getTraceId: () => string, getSpanId: () => string): winston.Logger {
// How to specify format per transport?
    const o = {
      console: {
        level: options.level,
        handleExceptions: true,
        humanReadableUnhandledException: true,
      },
    }

    // disable console if mode = production
    if (!options.enableConsole && !options.file) {
      throw new TechnicalException(new ErrorDO('logger.options', 'enableConsole.or.file.required', 'You must enable console or file logger'), new Error())
    }

    const loggerTransports: any[] = []
    if (options.enableConsole) {
      loggerTransports.push(new transports.Console(o.console))
    }
    if (options.file) {
      loggerTransports.push(new transports.File({ filename: options.file }))
    }
    return winston.createLogger({
      level: options.level,
      format: this.getLogFormatter(options.appName, options.appVersion, getTraceId, getSpanId, options.dateFormat),
      transports: loggerTransports,
      exitOnError: false, // do not exit on handled exceptions
    })
  }

  private static getLogFormatter(appName: string, appVersion: string, getTraceId: () => string, getSpanId: () => string, dateFormat?: string) {
    const localTimeZone = 'Europe/Paris'
    const { splat, combine } = format
    const exportZipkin = false

    const appendTimestamp = format((info, opts) => {
      if (opts.tz) {
        info.timestamp = moment()
          .tz(opts.tz)
          .format(dateFormat)
      }
      return info
    })

    const myFormat = winston.format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [thread${process.pid}] [${appName}-${appVersion},${getTraceId()},${getSpanId()},${exportZipkin}] ${level.toUpperCase()} - ${message}`
    })
    return combine(appendTimestamp({ tz: localTimeZone }), splat(), myFormat)
  }
}