import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { middlewares } from '../../../src/middlewares'
import { getLogger, IrisModule, LoggingInterceptor, TraceContextInterceptor } from '../../../src/modules/iris-module'
import { AddressBE } from '../../commons/objects/business/be/AddressBE'
import { CommandBE } from '../../commons/objects/business/be/CommandBE'
import { CommandLineBE } from '../../commons/objects/business/be/CommandLineBE'
import { ProductBE } from '../../commons/objects/business/be/ProductBE'
import { AmountCalculator } from '../../commons/services/business/AmountCalculator'
import { CommandLBS } from '../../commons/services/business/CommandLBS'
import { CommandDAO } from '../../commons/services/data/CommandDAO'
import { CommandEBS } from '../../commons/services/exposition/CommandEBS'
import { getTypeOrmConfiguration } from './connection.db'
import { testappIrisModuleOptions } from './testapp.module.options'

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfiguration()),
    TypeOrmModule.forFeature([AddressBE, CommandBE, CommandLineBE, ProductBE]),
    IrisModule.forRoot(testappIrisModuleOptions),
  ],
  controllers: [CommandEBS],
  providers: [CommandLBS, CommandDAO, AmountCalculator,
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    }],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    const middlewaresWithLogger = middlewares(getLogger())
    consumer.apply(middlewaresWithLogger.parseJSON).forRoutes('/')
    consumer.apply(middlewaresWithLogger.enableCors).forRoutes('/')
    consumer.apply(middlewaresWithLogger.enableCompression).forRoutes('/')
    consumer.apply(middlewaresWithLogger.enableSecurity).forRoutes('/')
    consumer.apply(middlewaresWithLogger.actuator).forRoutes('/actuator')
    return consumer
  }
}
