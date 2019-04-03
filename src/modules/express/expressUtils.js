import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import {
  EntityNotFoundBusinessException,
  TechnicalException,
  ErreurDO,
  BusinessException,
  SecurityException,
} from '@u-iris/iris-common'

/**
 * @returns severals utils middlewares for express
 * @param {*} logger winston object
 */
export const expressUtils = logger => ({
  /**
   * Transform body request to a JSON object
   */
  parseJSON: bodyParser.json(),
  /**
   * Log debug request
   */
  logRequests: (req, res, next) => {
    logger.debug(`verb=${req.method},uri=${req.url},queryParams=${req.params},ip=${req.ip},`)
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
    let status = 500
    let result = {}
    // build errors structure
    let errors = err.errors
    if (errors) {
      result = {
        errors: Array.isArray(errors) ? errors : [errors],
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
      case SecurityException:
        status = result.errors[0].codeErreur.startsWith('security.authentification') ? 401 : 403
        logger.error('SECURITY', err.errors)
        break
      default:
        result = { errors: [new ErreurDO(null, 'error', msg)] }
    }

    res.status(status).send(result)
  },
  /**
   * Enable cors with cors plugin
   */
  enableCors: cors(),
  /**
   * Enable compression with cors plugin
   */
  enableCompression: compression(),
  /**
   * Enable security with cors plugin
   */
  enableSecurity: helmet(),
  /**
   * Add to the header the content-type application/json
   */
  returnApplicationJson: (req, res, next) => {
    res.set('Content-Type', 'application/json')
    next()
  },
})
