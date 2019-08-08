import '@u-iris/iris-common-test-utils'
import 'reflect-metadata'
import * as constants from '../../../src/constants'
import { Relation } from '../../../src/decorators'
import { RelationEntity } from '../../../src/enums'
import { RelationMetadata } from '../../../src/interfaces/relation-metadata.interface'
import { OrderBE } from '../../commons/objects/business/be/OrderBE'
import { OrderLineBE } from '../../commons/objects/business/be/OrderLineBE'
import { ProductBE } from '../../commons/objects/business/be/ProductBE'
import { CustomerXBE } from '../../commons/objects/business/xbe/CustomerXBE'

describe('Decorator @Relation and @AllowedOptions', () => {
  it('should save relations with relation, allowedOption and type', () => {
    const ordersRelations: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, OrderBE)
    expect(Object.keys(ordersRelations)).toHaveLength(4)

    expect(ordersRelations.orderLines).toMatchObject({
      relation: RelationEntity.ASSOCIATION,
      allowedOption: true,
    })
    expect(ordersRelations.orderLines.type).toBeDefined()
    expect(ordersRelations.orderLines.type()).toEqual(OrderLineBE)

    expect(ordersRelations['orderLines.product']).toEqual({
      allowedOption: true,
    })
    expect(Reflect.getMetadata('design:type', ordersRelations.orderLines.type().prototype, 'product')).toEqual(ProductBE)

    expect(ordersRelations.customer).toEqual({
      relation: RelationEntity.ASSOCIATION,
      allowedOption: true,
    })
    expect(Reflect.getMetadata('design:type', OrderBE.prototype, 'customer')).toEqual(CustomerXBE)

    expect(ordersRelations.billingAddress).toEqual({
      relation: RelationEntity.ENTITY,
    })
  })

  it('should throw error because of no type of array defined', () => {
    expect(() => {
      class AccountBE {
        @Relation(RelationEntity.ENTITY)
        public orders: OrderBE[]
      }

      return new AccountBE()
    }).toThrowError(new Error('Please set element type of Array in @Relation 2nd parameter'))
  })
})
