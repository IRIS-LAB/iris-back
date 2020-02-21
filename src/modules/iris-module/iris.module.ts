import { DynamicModule, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { PATH_METADATA, SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants'
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface'
import { APP_GUARD } from '@nestjs/core'
import { APP_AUTHENTICATION_SERVICE, APP_AUTHORIZATION_SERVICE } from '../../constants'
import { ActuatorController } from '../../controllers/actuator.controller'
import { ConfigModule, getIrisConfigOptions, IrisConfigOptions } from '../config-module'
import { SecuredGuard } from './guards'
import { ActuatorSecurityMiddleware } from './middlewares/actuator-security.middleware'
import { CompressionMiddleware } from './middlewares/compression.middleware'
import { CorsMiddleware } from './middlewares/cors.middleware'
import { HelmetMiddleware } from './middlewares/helmet.middleware'
import { LoggerMiddleware } from './middlewares/logging.middleware'
import { RequestContextMiddleware } from './middlewares/request-context.middleware'
import { BusinessValidatorProvider, ClsProvider, ErrorProvider, LoggerProvider, MessageProvider } from './providers'
import {
  BusinessValidatorService,
  ClsService,
  DefaultAuthenticationService,
  DefaultAuthorizationService,
  ErrorService,
  LoggerService,
  MessageService,
} from './services'

@Module({})
export class IrisModule implements NestModule {

  public static forRoot(options: IrisConfigOptions): DynamicModule {
    const controllers: ModuleMetadata['controllers'] = []

    const modulesToImport: ModuleMetadata['imports'] = [
      ConfigModule.forRoot(options),
    ]

    const irisConfigOptions = getIrisConfigOptions(options)
    if (irisConfigOptions.imports && irisConfigOptions.imports.length) {
      modulesToImport.push(...irisConfigOptions.imports)
    }
    if (irisConfigOptions.actuatorOptions!.enable) {
      Reflect.defineMetadata(PATH_METADATA, irisConfigOptions.actuatorOptions!.endpoint, ActuatorController)
      Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, undefined, ActuatorController)
      controllers.push(ActuatorController)
    }

    return {
      module: IrisModule,
      imports: modulesToImport,
      controllers,
      providers: [
        MessageService,
        ErrorService,
        LoggerService,
        ClsService,
        BusinessValidatorService,
        MessageProvider,
        ErrorProvider,
        LoggerProvider,
        ClsProvider,
        BusinessValidatorProvider,
        RequestContextMiddleware,
        {
          provide: APP_GUARD,
          useClass: SecuredGuard,
        },
        {
          provide: APP_AUTHORIZATION_SERVICE,
          useClass: options.authorizationProvider || DefaultAuthorizationService,
        },
        {
          provide: APP_AUTHENTICATION_SERVICE,
          useClass: options.authenticationProvider || DefaultAuthenticationService,
        },
      ],
      exports: [
        MessageService,
        ErrorService,
        LoggerService,
        ClsService,
        BusinessValidatorService,
        MessageProvider,
        ErrorProvider,
        LoggerProvider,
        ClsProvider,
        BusinessValidatorProvider,
        ConfigModule,
        {
          provide: APP_AUTHORIZATION_SERVICE,
          useExisting: true,
        },
        {
          provide: APP_AUTHENTICATION_SERVICE,
          useExisting: true,
        },
      ],
    }
  }

  public configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(CompressionMiddleware, RequestContextMiddleware, LoggerMiddleware, CorsMiddleware, HelmetMiddleware).forRoutes('/')
      .apply(ActuatorSecurityMiddleware).forRoutes(
      { path: '/actuator', method: RequestMethod.POST },
      { path: '/actuator', method: RequestMethod.PUT },
      { path: '/actuator/metrics', method: RequestMethod.GET },
      { path: '/actuator/env', method: RequestMethod.GET })
  }

}
