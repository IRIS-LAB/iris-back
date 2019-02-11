import cors from 'cors'
import bodyParser from 'body-parser'
import {
  EntityNotFoundBusinessException,
  TechnicalException,
  ErrorDO,
  BusinessException
} from '@ugieiris/iris-common'

/**
 * @returns severals utils middlewares for express
 * @param {*} logger winston object
 */
export const expressUtils = logger => {
  return {
    /**
     * Transform body request to a JSON object
     */
    parseJSON: bodyParser.json(),
    /**
     * Log debug request
     */
    logRequests: (req, res, next) => {
      logger.debug(
        `request:${JSON.stringify({
          method: req.method,
          host: req.headers.host,
          url: req.url,
          body: req.body,
          params: req.params
        })}`
      )
      next()
    },
    /**
     * Error handler, log the error and return the good status
     */
    errorHandler: (err, req, res, next) => {
      if (res.headersSent) {
        return next(err)
      }
      const msg = err.data || err.message
      logger.error(`${msg} : ${err.stack}`)
      let status = 400
      let result = {}
      // build errors structure
      let errors = err.errors
      if (errors) {
        result = {
          errors: Array.isArray(errors) ? errors : [errors]
        }
      }
      // init status
      switch (err.constructor) {
        case EntityNotFoundBusinessException:
          status = 404
          break
        case BusinessException:
          status = 400
          break
        case TechnicalException:
          status = 500
          break
        default:
          result = { errors: [new ErrorDO(null, 'error', msg)] }
      }

      res.status(status).send(result)
    },
    /**
     * Enable cors with cors plugin
     */
    enableCors: cors(),
    /**
     * Add to the header the content-type application/json
     */
    returnApplicationJson: (req, res, next) => {
      res.set('Content-Type', 'application/json')
      next()
    }
  }
}
