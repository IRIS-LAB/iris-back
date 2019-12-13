import { DiskHealthIndicatorOptions } from '@nestjs/terminus/dist/health-indicators/disk/disk-health-options.type'
import { CompressionOptions } from 'compression'
import { CorsOptions } from 'cors'
import { IHelmetConfiguration } from 'helmet'
import { LoggerOptions } from '../../interfaces'

export type ExtendedLoggerOptions = LoggerOptions & { level: 'debug' | 'warn' | 'info' | 'error' }

const DEFAULT_OPTIONS: Partial<IrisConfigOptions> = {
  traceIdHeader: 'X-B3-TraceId',
  actuatorOptions: {
    enable: true,
    endpoint: '/actuator/health',
    enablePing: true,
    pingUri: 'https://google.com',
    enableTypeOrm: true,
    enableMemoryHeapThreshold: false,
    memoryHeapUsedThreshold: 1024,
    enableDiskStorageThreshold: false,
  },
  enableCors: true,
  enableHelmet: true,
  enableCompression: true,
}

export interface IrisConfigOptions {
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
  actuatorOptions?: {
    /**
     * Enable/disable actuator path (default: true).
     */
    enable?: boolean

    /**
     * Enpoint of actuator checkhealth (default : /actuator/health).
     */
    endpoint?: string

    /**
     * Enable/disable check of dns ping (default: true).
     */
    enablePing?: boolean
    /**
     * URI for the ping check (default : https://google.com).
     */
    pingUri?: string

    /**
     * Enable/disable check of database connections managed by TypeOrm (default: true).
     */
    enableTypeOrm?: boolean

    /**
     * Enable/disable check of memory heap threshold (node process should not exceed the memory usage defined in memoryHeapUsedThreshold option.
     */
    enableMemoryHeapThreshold?: boolean

    /**
     * Max memory (in Mb) for memory heap threshold check (default: 1024).
     */
    memoryHeapUsedThreshold?: number

    /**
     * Enable/disable check of disk storage threshold (node process should not exceed the disk storage theshold defined in diskStorageThresholdOptions option.
     */
    enableDiskStorageThreshold?: boolean

    /**
     * Options for disk storage threshold check.
     */
    diskStorageThresholdOptions?: DiskHealthIndicatorOptions
  }

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

