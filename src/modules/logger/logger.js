import moment from 'moment-timezone'
import { createLogger, format, transports } from 'winston'

/**
 * Object to create a logger
 */
export const Logger = {
  /**
   * Create a new Logger
   * @param {String} logLevel (debug, info, error)
   * @param {String} pathFileName : path of the log file
   * @returns Winston Object Logger
   */
  create(logLevel, pathFileName) {
    const localTimeZone = 'Europe/Paris'
    const { splat, combine, timestamp, printf, colorize } = format

    const myFormat = printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level} ${message}`
    })

    const appendTimestamp = format((info, opts) => {
      if (opts.tz)
        info.timestamp = moment()
          .tz(opts.tz)
          .format()
      return info
    })

    // How to specify format per transport?
    const options = {
      file: {
        level: logLevel,
        filename: pathFileName,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        maxsize: 52428800, // 50MB
        maxFiles: 5
      },
      console: {
        level: logLevel,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        format: combine(colorize(), myFormat)
      }
    }

    // disable console if mode = production
    const loggerTransports = [new transports.File(options.file)]
    if (process.env.NODE_ENV !== 'production') {
      loggerTransports.push(new transports.Console(options.console))
    }

    return createLogger({
      level: logLevel,
      format: combine(appendTimestamp({ tz: localTimeZone }), splat(), myFormat),
      transports: loggerTransports,
      exitOnError: false // do not exit on handled exceptions
    })
  }
}
