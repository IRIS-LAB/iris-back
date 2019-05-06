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
  create(logLevel, pathFileName = null) {
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
        maxFiles: 5,
      },
      console: {
        level: logLevel,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        format: combine(colorize(), myFormat),
      },
    }

    // disable console if mode = production
    const loggerTransports = []
    if (options.file.filename) loggerTransports.push(new transports.File(options.file))
    if (process.env.NODE_ENV !== 'production') {
      loggerTransports.push(new transports.Console(options.console))
    } else if (!options.file.filename) throw new Error('You must set a pathFileName in production environment')

    let logger = createLogger({
      level: logLevel,
      format: combine(appendTimestamp({ tz: localTimeZone }), splat(), myFormat),
      transports: loggerTransports,
      exitOnError: false, // do not exit on handled exceptions
    })

    // create withMorganStream() function utility to bind winston logger to morgan (see example above)
    // app.use(require("morgan")("combined", { "stream": logger.stream }));
    logger.withMorganStream = function () {
      logger.stream = {
        write: function (message, encoding) {
          logger.info(message)
        }
      }
      return logger
    }
    return logger
  },
}
