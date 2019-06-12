import express from 'express'
import { ILogger } from '../logger'

/**
 * Log debug request
 */
export const logRequests = (logger: ILogger) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.info(`verb=${req.method},uri=${req.url},queryParams=${JSON.stringify(req.query)},ip=${req.ip},`)
  next()
}
