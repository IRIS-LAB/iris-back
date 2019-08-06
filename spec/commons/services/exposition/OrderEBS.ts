import { Controller, Get, Post } from '@nestjs/common'
import {
  BodyParam,
  DateQueryParam,
  EntityOptionsQueryParam,
  EnumQueryParam,
  NumberQueryParam,
  PaginatedEntitiesQueryParam,
  PathParam,
  StringQueryParam,
} from '../../../../src/decorators'
import { EntityOptions, PaginatedEntitiesOptions } from '../../../../src/interfaces'
import { PaginatedResources, Resource } from '../../../../src/modules/iris-module/decorators'
import { PaginatedListResult } from '../../../../src/modules/iris-module/interfaces'
import { OrderBE } from '../../objects/business/be/OrderBE'
import { OrderState } from '../../objects/business/be/OrderState'
import { OrderLBS } from '../business/order-l-b-s.service'

@Controller('/orders')
export class OrderEBS {

  constructor(private readonly orderLBS: OrderLBS) {
  }

  @Get('/')
  @PaginatedResources(OrderBE, 'orders', 10, 100)
  public async findAll(@PaginatedEntitiesQueryParam() paginatedResourcesOptions: PaginatedEntitiesOptions,
                       @NumberQueryParam('customer.id') customerId: number,
                       @EnumQueryParam({
                         type: OrderState,
                         key: 'orderState',
                       }) orderState: OrderState,
                       @StringQueryParam('reference') reference: string,
                       @DateQueryParam('deliveryData.deliveryDate.gte') deliveryDateGte: Date,
                       @DateQueryParam('deliveryData.deliveryDate.lte') beforeDateLivraison: Date,
                       @StringQueryParam('badfilter') badfilter: string,
                       @StringQueryParam('deliveryData.badfilter') deliveryDataBadfilter: string,
  ): Promise<PaginatedListResult<OrderBE>> {
    return this.orderLBS.findWithPaginationResult(paginatedResourcesOptions, {
        'customer.id': customerId,
        'reference': reference,
        'state': orderState,
        'deliveryData.deliveryDate': {
          gte: deliveryDateGte,
          lte: beforeDateLivraison,
        },
        'badfilter': badfilter,
        'deliveryData.badfilter': deliveryDataBadfilter,
      },
    )
  }

  @Get('/:id')
  @Resource(OrderBE)
  public async findById(@EntityOptionsQueryParam() queryableParam: EntityOptions, @PathParam('id') id: number): Promise<OrderBE> {
    return this.orderLBS.findById(id, queryableParam)
  }

  @Post('/')
  @Resource(OrderBE)
  public async createOrder(@EntityOptionsQueryParam() queryableParam: EntityOptions, @BodyParam() newOrder: OrderBE): Promise<OrderBE> {
    return this.orderLBS.createOrder(newOrder, queryableParam)
  }
}
