import { DynamicModule, Module } from '@nestjs/common'
import { irisModuleOptions, IrisModuleOptions, setIrisModuleOptions } from './config-holder'
import { LoggingInterceptor, RequestContextInterceptor } from './interceptors'
import { BusinessValidatorProvider, ClsProvider, ErrorProvider, LoggerProvider, MessageProvider } from './providers'

@Module({
  imports: [],
  providers: [
    MessageProvider,
    ErrorProvider,
    LoggerProvider,
    ClsProvider,
    RequestContextInterceptor,
    LoggingInterceptor
  ],
  exports: [
    MessageProvider,
    ErrorProvider,
    LoggerProvider,
    ClsProvider,
    RequestContextInterceptor,
    LoggingInterceptor
  ]
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
        BusinessValidatorProvider
      ],
      exports: [
        MessageProvider,
        ErrorProvider,
        LoggerProvider,
        ClsProvider,
        RequestContextInterceptor,
        LoggingInterceptor,
        BusinessValidatorProvider
      ]
    }
  }

  constructor() {
    if (!irisModuleOptions) {
      throw new Error('You must import IrisModule by using IrisModule.forRoot()')
    }
  }
}
