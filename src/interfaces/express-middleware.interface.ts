import express from 'express'
import { Logger } from 'winston'

export type ExpressMiddleware = (logger: Logger) => (express.RequestHandler | express.ErrorRequestHandler)
