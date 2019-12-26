import { Test, TestingModule } from '@nestjs/testing'
import { OrderBE } from '../../../commons/objects/business/be/OrderBE'
import { OrderLineBE } from '../../../commons/objects/business/be/OrderLineBE'
import { OrderState } from '../../../commons/objects/business/be/OrderState'
import { OrderDAO } from '../../../commons/services/data/OrderDAO'
import { TestUtils } from '../../../commons/test.utils'
import { DatabaseTestUtils } from '../../database-test-utils.service'
import '../../e2e-config-loader'
import { AppModule } from '../../module/testapp.module'

describe('OrderDAO (e2e)', () => {
  let app
  let databaseTestUtils: DatabaseTestUtils
  let orderDAO: OrderDAO

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [DatabaseTestUtils],
    }).compile()
    app = TestUtils.constructApplicationFromModule(moduleFixture)
    orderDAO = moduleFixture.get<OrderDAO>(OrderDAO)
    databaseTestUtils = moduleFixture.get<DatabaseTestUtils>(DatabaseTestUtils)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    TestUtils.cleanApplication()
  })

  beforeEach(async () => {
    await databaseTestUtils.cleanDatabase()
  })

  describe('queryBuilder', () => {
    it('should load eager relations', async () => {
      let order = new OrderBE()
      order.reference = '123'
      order.state = OrderState.PENDING
      order.customer = { id: 1 }
      order.orderLinesWithoutRelation = []

      const orderLine1 = new OrderLineBE()
      orderLine1.quantity = 3
      orderLine1.product = { amount: 3, label: 'product 2' }
      orderLine1.amount = 9
      order.orderLinesWithoutRelation.push(orderLine1)

      const orderLine2 = new OrderLineBE()
      orderLine2.product = { amount: 15, label: 'product 3' }
      orderLine2.quantity = 2
      orderLine2.amount = 30
      order.orderLinesWithoutRelation.push(orderLine2)

      order = await orderDAO.save(order)
      const results = await orderDAO.createQueryBuilder()
        .getMany()

      expect(results).toHaveLength(1)

      const result1 = results[0]
      expect(result1).toBeDefined()
      expect(result1.orderLinesWithoutRelation).toBeDefined()
      expect(result1.orderLinesWithoutRelation).toHaveLength(2)
      expect(result1.orderLinesWithoutRelation![0].product).toBeDefined()
      expect(result1.orderLinesWithoutRelation![0].product.label).toEqual('product 2')
      expect(result1.orderLinesWithoutRelation![1].product).toBeDefined()
      expect(result1.orderLinesWithoutRelation![1].product.label).toEqual('product 3')
    })
  })


})