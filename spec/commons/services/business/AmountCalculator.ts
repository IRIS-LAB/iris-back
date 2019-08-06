import { Injectable } from '@nestjs/common'
import { OrderBE } from '../../objects/business/be/OrderBE'
import { OrderLineBE } from '../../objects/business/be/OrderLineBE'

@Injectable()
export class AmountCalculator {

  public calculateOrderAmount(order: OrderBE): void {
    order.amount = order && order.orderLines ?
      order.orderLines.reduce((sum: number, orderLine: OrderLineBE) => {
        this.calculateOrderLineAmount(orderLine)
        return sum + orderLine.amount!
      }, 0)
      : 0
  }

  private calculateOrderLineAmount(orderLine: OrderLineBE): void {
    orderLine.amount = orderLine.product.amount * orderLine.quantity
  }
}
