import { OrderBE } from './objects/business/be/OrderBE'

export class FixturesUtils {
  public static ordersFixtures(count: number): OrderBE[] {
    const orders: OrderBE[] = []
    while (orders.length < count) {
      const id = orders.length + 1
      orders.push({
        id,
        amount: 0,
        billingAddress: {
          id,
          country: 'FRANCE',
          line1: 'line 1',
          line2: 'line 2',
        },
        orderLines: [
          {
            id: id * 10 + 1,
            quantity: 1,
            product: {
              id: 1,
              label: 'product 1',
              amount: 4.99,
            },
          },
          {
            id: id * 10 + 2,
            quantity: 3,
            product: {
              id: 2,
              label: 'product 2',
              amount: 19.90,
            },
          },
        ],
        customer: {
          id,
          name: `customer ${id}`,
          email: `user${id}@mycompany.com`,
        },
        reference: `REF.${id}`,
      })
    }
    return orders
  }
}
