import { LoggerOptions } from '../../interfaces'

export type ExtendedLoggerOptions = LoggerOptions & { level: 'debug' | 'warn' | 'info' | 'error' }

const DEFAULT_OPTIONS = {
  traceIdHeader: 'X-B3-TraceId',
}

export interface IrisModuleOptions {
  logger: ExtendedLoggerOptions
  traceIdHeader?: string
  messagesSources?: string | string[]
}

export let irisModuleOptions: IrisModuleOptions

export function setIrisModuleOptions(options: IrisModuleOptions) {
  irisModuleOptions = {...DEFAULT_OPTIONS, ...options}
}

