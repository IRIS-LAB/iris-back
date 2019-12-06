import { DynamicModule, Module } from '@nestjs/common'
import { APP_AUTHENTICATION_SERVICE, APP_AUTHORIZATION_SERVICE } from '../../constants'
import { irisModuleOptions, IrisModuleOptions, setIrisModuleOptions } from './config-holder'
import { LoggingInterceptor, RequestContextInterceptor } from './interceptors'
import { BusinessValidatorProvider, ClsProvider, ErrorProvider, LoggerProvider, MessageProvider } from './providers'
import { DefaultAuthenticationProvider } from './providers/default-authentication.provider'
import { DefaultAuthorizationProvider } from './providers/default-authorization.provider'

@Module({
  imports: [],
  providers: [
    MessageProvider,
    ErrorProvider,
    LoggerProvider,
    ClsProvider,
    RequestContextInterceptor,
    LoggingInterceptor,
  ],
  exports: [
    MessageProvider,
    ErrorProvider,
    LoggerProvider,
    ClsProvider,
    RequestContextInterceptor,
    LoggingInterceptor,
  ],
})
export class IrisModule {

  public static forRoot(options: IrisModuleOptions): DynamicModule {
    setIrisModuleOptions(options)
    return {
      module: IrisModule,
      providers: [
        MessageProvider,
        ErrorProvider,
        LoggerProvider,
        ClsProvider,
        RequestContextInterceptor,
        LoggingInterceptor,
        BusinessValidatorProvider,
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
        RequestContextInterceptor,
        LoggingInterceptor,
        BusinessValidatorProvider,
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
}
