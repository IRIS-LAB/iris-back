import express from 'express'
import { ILogger } from '../logger'

export type ExpressMiddleware = (logger: ILogger) => (express.RequestHandler | express.ErrorRequestHandler)
