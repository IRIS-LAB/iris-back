import '../e2e-config-loader'

import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TypeormQueryBuilder } from '../../../src/utils'
import { OrderBE } from '../../commons/objects/business/be/OrderBE'
import { TestUtils } from '../../commons/test.utils'
import { DatabaseTestUtils } from '../database-test-utils.service'
import { AppModule } from '../module/testapp.module'

const checkFieldAccessor = <T>(queryBuilder: TypeormQueryBuilder<T>, field: string, expectedAccessor: string) => {
  queryBuilder.withRelationToField(field)
  expect(queryBuilder.getQueryBuilderFieldAccessor(field)).toEqual(expectedAccessor)
}
describe('TypeormQuerybuilder', () => {
  let app
  let orderRepository: Repository<OrderBE>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [DatabaseTestUtils],
    }).compile()
    app = TestUtils.constructApplicationFromModule(moduleFixture)
    orderRepository = moduleFixture.get(getRepositoryToken(OrderBE))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    TestUtils.cleanApplication()
  })

  describe('addRelationToField', () => {
    it('should not add relation for simple field', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      typeormQueryBuilder.withRelationToField('id')
      typeormQueryBuilder.withRelationToField('reference')
      typeormQueryBuilder.withRelationToField('amount')
      typeormQueryBuilder.withRelationToField('state')
      expect(Object.keys(typeormQueryBuilder.relations)).toHaveLength(0)
    })

    it('should add relation for one to many relation', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      typeormQueryBuilder.withRelationToField('orderLines')
      expect(Object.keys(typeormQueryBuilder.relations)).toHaveLength(1)
      expect(typeormQueryBuilder.relations.orderLines).toBeDefined()
    })
    it('should not add relation for embedded relation', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      typeormQueryBuilder.withRelationToField('deliveryData.deliveryDate')
      typeormQueryBuilder.withRelationToField('customer.id')
      expect(Object.keys(typeormQueryBuilder.relations)).toHaveLength(0)
    })
    it('should add relation for fields from relation', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      typeormQueryBuilder.withRelationToField('orderLines.quantity')
      typeormQueryBuilder.withRelationToField('orderLines.amount')
      typeormQueryBuilder.withRelationToField('orderLinesWithoutRelation.amount')
      expect(Object.keys(typeormQueryBuilder.relations)).toHaveLength(2)
      expect(typeormQueryBuilder.relations.orderLines).toBeDefined()
      expect(typeormQueryBuilder.relations.orderLinesWithoutRelation).toBeDefined()
    })

    it('should add 2 relations for children relation', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      typeormQueryBuilder.withRelationToField('orderLines.product')
      expect(Object.keys(typeormQueryBuilder.relations)).toHaveLength(2)
      expect(typeormQueryBuilder.relations.orderLines).toBeDefined()
      expect(typeormQueryBuilder.relations['orderLines.product']).toBeDefined()
    })

    it('should add relation for one to many relation without relation', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      typeormQueryBuilder.withRelationToField('orderLinesWithoutRelation')
      expect(Object.keys(typeormQueryBuilder.relations)).toHaveLength(1)
      expect(typeormQueryBuilder.relations.orderLinesWithoutRelation).toBeDefined()
    })
  })

  describe('getSelectQueryBuilder', () => {
    it('should work for simple field', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      checkFieldAccessor(typeormQueryBuilder, 'id', 'order.id')
      checkFieldAccessor(typeormQueryBuilder, 'reference', 'order.reference')
      checkFieldAccessor(typeormQueryBuilder, 'amount', 'order.amount')
      checkFieldAccessor(typeormQueryBuilder, 'state', 'order.state')
    })

    it('should work for nested relation', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      checkFieldAccessor(typeormQueryBuilder, 'orderLines.quantity', 'orderLines.quantity')
      checkFieldAccessor(typeormQueryBuilder, 'orderLines.amount', 'orderLines.amount')
    })

    it('should work for embedded object', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      checkFieldAccessor(typeormQueryBuilder, 'deliveryData.deliveryDate', 'order.deliveryData.deliveryDate')
      checkFieldAccessor(typeormQueryBuilder, 'customer.id', 'order.customer.id')
    })

    it('should work for chaining relation', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      checkFieldAccessor(typeormQueryBuilder, 'orderLines.product.label', 'orderLines_product.label')
    })

    it('should work for typeorm relation without iris relation', () => {
      const typeormQueryBuilder = new TypeormQueryBuilder(orderRepository)
      checkFieldAccessor(typeormQueryBuilder, 'orderLinesWithoutRelation.quantity', 'orderLinesWithoutRelation.quantity')
    })
  })
})
