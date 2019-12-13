import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface'
import { APP_GUARD } from '@nestjs/core'
import { TerminusModule } from '@nestjs/terminus'
import { APP_AUTHENTICATION_SERVICE, APP_AUTHORIZATION_SERVICE } from '../../constants'
import { ConfigModule, getIrisConfigOptions, IrisConfigOptions } from '../config-module'
import { RolesGuard } from './guards'
import { CompressionMiddleware } from './middlewares/compression.middleware'
import { CorsMiddleware } from './middlewares/cors.middleware'
import { HelmetMiddleware } from './middlewares/helmet.middleware'
import { LoggerMiddleware } from './middlewares/logging.middleware'
import { RequestContextMiddleware } from './middlewares/request-context.middleware'
import { BusinessValidatorProvider, ClsProvider, ErrorProvider, LoggerProvider, MessageProvider } from './providers'
import { DefaultAuthenticationProvider } from './providers/default-authentication.provider'
import { DefaultAuthorizationProvider } from './providers/default-authorization.provider'
import { RequestHolder } from './providers/request-holder.provider'
import { TerminusOptionsProvider } from './providers/terminus-options-provider'

@Module({})
export class IrisModule implements NestModule {

  public static forRoot(options: IrisConfigOptions): DynamicModule {
    const irisConfigOptions = getIrisConfigOptions(options)


    const modulesToImport: ModuleMetadata['imports'] = [
      ConfigModule.forRoot(options),
    ]

    if (irisConfigOptions.actuatorOptions!.enable) {
      modulesToImport.push(
        TerminusModule.forRootAsync({
          useClass: TerminusOptionsProvider,
          imports: [
            ConfigModule.forRoot(options),
          ],
        }))
    }

    return {
      module: IrisModule,
      imports: modulesToImport,
      providers: [
        TerminusOptionsProvider,
        MessageProvider,
        ErrorProvider,
        LoggerProvider,
        ClsProvider,
        BusinessValidatorProvider,
        RequestHolder,
        RequestContextMiddleware,
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
        BusinessValidatorProvider,
        RequestHolder,
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
  }

}
