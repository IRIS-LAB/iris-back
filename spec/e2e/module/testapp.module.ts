import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { middlewares } from '../../../src/middlewares'
import { IrisModule, LoggingInterceptor, RequestContextInterceptor } from '../../../src/modules/iris-module'
import { AddressBE } from '../../commons/objects/business/be/AddressBE'
import { OrderBE } from '../../commons/objects/business/be/OrderBE'
import { OrderLineBE } from '../../commons/objects/business/be/OrderLineBE'
import { ProductBE } from '../../commons/objects/business/be/ProductBE'
import { AmountCalculator } from '../../commons/services/business/AmountCalculator'
import { OrderLBS } from '../../commons/services/business/OrderLBS'
import { OrderDAO } from '../../commons/services/data/OrderDAO'
import { OrderEBS } from '../../commons/services/exposition/OrderEBS'
import { getTypeOrmConfiguration } from './connection.db'
import { testappIrisModuleOptions } from './testapp.module.options'

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfiguration()),
    TypeOrmModule.forFeature([AddressBE, OrderBE, OrderLineBE, ProductBE]),
    IrisModule.forRoot(testappIrisModuleOptions),
  ],
  controllers: [OrderEBS],
  providers: [OrderLBS, OrderDAO, AmountCalculator,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    }],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(middlewares.parseJSON()).forRoutes('/')
    consumer.apply(middlewares.enableCors()).forRoutes('/')
    consumer.apply(middlewares.enableCompression()).forRoutes('/')
    consumer.apply(middlewares.enableSecurity()).forRoutes('/')
    consumer.apply(middlewares.actuator()).forRoutes('/actuator')
    return consumer
  }
}
