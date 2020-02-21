import { Injectable } from '@nestjs/common'
import { EntityOptions, PaginatedEntitiesOptions } from '../../../../src/interfaces'
import { PaginatedListResult } from '../../../../src/modules/iris-module/interfaces'
import { BusinessValidatorService, ErrorService } from '../../../../src/modules/iris-module/services'
import { OrderBE } from '../../objects/business/be/OrderBE'
import { OrderState } from '../../objects/business/be/OrderState'
import { OrderFilterQuery } from '../../objects/filter/OrderFilterQuery'
import { OrderDAO } from '../data/OrderDAO'
import { AmountCalculator } from './AmountCalculator'


@Injectable()
export class OrderLBS {

  constructor(private readonly businessValidatorService: BusinessValidatorService, private readonly orderDAO: OrderDAO, private readonly amountCalculator: AmountCalculator, private readonly errorService: ErrorService) {
  }

  public async findAll(query?: PaginatedEntitiesOptions, filters?: OrderFilterQuery): Promise<OrderBE[]> {
    return this.orderDAO.find(filters, query)
  }

  public async count(query?: PaginatedEntitiesOptions, filters?: OrderFilterQuery): Promise<number> {
    return this.orderDAO.count(filters, query)
  }

  public async findWithPaginationResult(query?: PaginatedEntitiesOptions, filters?: OrderFilterQuery): Promise<PaginatedListResult<OrderBE>> {
    return this.orderDAO.findWithPaginationResult(filters, query)
  }

  public async findById(id: number, query?: EntityOptions): Promise<OrderBE> {
    const order = await this.orderDAO.findById(id, query)
    if (!order) {
      throw this.errorService.createEntityNotFoundBusinessException('orders', id)
    }
    return order
  }

  public async createOrder(order: OrderBE, query?: EntityOptions): Promise<OrderBE> {
    order.state = OrderState.SAVED
    this.amountCalculator.calculateOrderAmount(order)
    order = this.businessValidatorService.validate(order)
    return this.orderDAO.save(order, query)
  }

  public async deleteOrder(id: number): Promise<OrderBE> {
    return this.orderDAO.remove(await this.findById(id))
  }

  public async updateOrderState(orderId: number, orderState: OrderState): Promise<OrderBE> {
    const order = await this.orderDAO.findById(orderId)
    if (!order) {
      throw this.errorService.createEntityNotFoundBusinessException('order', orderId)
    }
    order.state = orderState
    return this.orderDAO.save(order)
  }
}
