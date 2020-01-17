import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface'
import { CompressionOptions } from 'compression'
import { CorsOptions } from 'cors'
import { IHelmetConfiguration } from 'helmet'
import { LoggerOptions } from '../../interfaces'

export type ExtendedLoggerOptions = LoggerOptions & { level: 'debug' | 'warn' | 'info' | 'error' }

const DEFAULT_OPTIONS: Partial<IrisConfigOptions> = {
  traceIdHeader: 'X-B3-TraceId',
  actuatorOptions: {
    enable: true,
    endpoint: '/actuator',
    role: 'ACTUATOR',
    enableTypeOrm: true,
    gitMode: 'simple',
  },
  enableCors: true,
  enableHelmet: true,
  enableCompression: true,
}

export interface IrisActuatorConfigOptions {
  /**
   * Enable/disable actuator path (default: true).
   */
  enable?: boolean

  /**
   * Enpoint of actuator checkhealth (default : /actuator/health).
   */
  endpoint?: string

  /**
   * Enable/disable check of database connections managed by TypeOrm (default: true).
   */
  enableTypeOrm?: boolean

  /**
   * Git informations mode.
   */
  gitMode?: 'simple' | 'full'

  /**
   * Required role to access to secured healh checker endpoints.
   */
  role?: string
}

export interface IrisConfigOptions {

  /**
   * NestJS Module to imports (used to provide authorization and authentication providers).
   */
  imports?: ModuleMetadata['imports']

  /**
   * Logger options.
   */
  logger: ExtendedLoggerOptions

  /**
   * Header name that contains trace identifier
   */
  traceIdHeader?: string

  /**
   * List of files to load for messages (*.propertie)
   */
  messagesSources?: string | string[]

  /**
   * Authorization provider.
   */
  authorizationProvider?: any

  /**
   * Authentication provider.
   */
  authenticationProvider?: any

  /**
   * Actuator options.
   */
  actuatorOptions?: IrisActuatorConfigOptions

  /**
   * Enable / disable cors for all routes (default: true).
   */
  enableCors?: boolean

  /**
   * CORS options.
   */
  corsOptions?: CorsOptions

  /**
   * Enable / disable helmet middleware for all routes (default: true).
   */
  enableHelmet?: boolean

  /**
   * Helmet options.
   */
  helmetOptions?: IHelmetConfiguration

  /**
   * Enable / disable compression middleware for all routes (default: true).
   */
  enableCompression?: boolean

  /**
   * Helmet options.
   */
  compressionOptions?: CompressionOptions

  secured?: boolean | string | string[]
}

/**
 * @deprecated use IrisConfigOptions instead.
 */
export type IrisModuleOptions = IrisConfigOptions

export function getIrisConfigOptions(options: IrisConfigOptions): IrisConfigOptions {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    actuatorOptions: { ...DEFAULT_OPTIONS.actuatorOptions, ...(options && options.actuatorOptions ? options.actuatorOptions : {}) },
  }
}

