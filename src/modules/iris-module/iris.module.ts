import { DynamicModule, Module } from '@nestjs/common'
import { irisModuleOptions, IrisModuleOptions, setIrisModuleOptions } from './config-holder'
import { LoggingInterceptor, TraceContextInterceptor } from './interceptors'
import { BusinessValidatorProvider, ClsProvider, ErrorProvider, LoggerProvider, MessageProvider } from './providers'

@Module({
  imports: [],
  providers: [
    MessageProvider,
    ErrorProvider,
    LoggerProvider,
    ClsProvider,
    TraceContextInterceptor,
    LoggingInterceptor
  ],
  exports: [
    MessageProvider,
    ErrorProvider,
    LoggerProvider,
    ClsProvider,
    TraceContextInterceptor,
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
        TraceContextInterceptor,
        LoggingInterceptor,
        BusinessValidatorProvider
      ],
      exports: [
        MessageProvider,
        ErrorProvider,
        LoggerProvider,
        ClsProvider,
        TraceContextInterceptor,
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
