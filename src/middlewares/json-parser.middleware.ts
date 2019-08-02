import bodyParser from 'body-parser'
import { Logger } from 'winston'
import { ExpressMiddleware } from '../interfaces'

/**
 * Transform body request to a JSON object
 */
export const parseJSON: ExpressMiddleware = (logger?: Logger) => bodyParser.json()
