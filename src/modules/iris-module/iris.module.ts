import { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { APP_AUTHENTICATION_SERVICE, APP_AUTHORIZATION_SERVICE } from '../../constants'
import { irisModuleOptions, IrisModuleOptions, setIrisModuleOptions } from './config-holder'
import { RolesGuard } from './guards'
import { LoggingInterceptor } from './interceptors'
import { LoggerMiddleware } from './middlewares/logging.middleware'
import { RequestContextMiddleware } from './middlewares/request-context.middleware'
import { BusinessValidatorProvider, ClsProvider, ErrorProvider, LoggerProvider, MessageProvider } from './providers'
import { DefaultAuthenticationProvider } from './providers/default-authentication.provider'
import { DefaultAuthorizationProvider } from './providers/default-authorization.provider'
import { RequestHolder } from './providers/request-holder.provider'

export class IrisModule implements NestModule {

  public static forRoot(options: IrisModuleOptions): DynamicModule {
    setIrisModuleOptions(options)
    return {
      module: IrisModule,
      providers: [
        MessageProvider,
        ErrorProvider,
        LoggerProvider,
        ClsProvider,
        LoggingInterceptor,
        BusinessValidatorProvider,
        RequestHolder,
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
        {
          provide: APP_AUTHORIZATION_SERVICE,
          useClass: options.authorizationProvider || DefaultAuthorizationProvider,
        },
        {
          provide: APP_AUTHENTICATION_SERVICE,
          useClass: options.authenticationProvider || DefaultAuthenticationProvider,
        },
      ],
      exports: [
        MessageProvider,
        ErrorProvider,
        LoggerProvider,
        ClsProvider,
        LoggingInterceptor,
        BusinessValidatorProvider,
        RequestHolder,
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

  constructor() {
    if (!irisModuleOptions) {
      throw new Error('You must import IrisModule by using IrisModule.forRoot()')
    }
  }

  public configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(RequestContextMiddleware, LoggerMiddleware).forRoutes('/')
  }

}
