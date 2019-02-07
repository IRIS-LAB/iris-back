import cors from 'cors'
import bodyParser from 'body-parser'
import {
  EntityNotFoundBusinessException,
  TechnicalException
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
      logger.error(`${err.data || err.message} : ${err.stack}`)
      let status = 400
      switch (err.constructor) {
        case TechnicalException:
          status = 500
          break
        case EntityNotFoundBusinessException:
          status = 404
          break
      }

      res.status(status).send({ data: err.data || err.message })
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
