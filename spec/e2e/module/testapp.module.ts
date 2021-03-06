import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { IrisModule } from '../../../src/modules/iris-module'
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
  providers: [OrderLBS, OrderDAO, AmountCalculator],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    return consumer
  }
}
