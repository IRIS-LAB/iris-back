import { Test, TestingModule } from '@nestjs/testing'
import { AddressBE } from '../../../commons/objects/business/be/AddressBE'
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
    jest.clearAllMocks()
    await databaseTestUtils.cleanDatabase()
  })

  describe('createQueryBuilder', () => {
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
      result1.orderLinesWithoutRelation?.forEach(r => {
        expect(r).toBeDefined()
        expect(r.product).toBeDefined()
        expect(r.product.label).toBeDefined()
      })
    })

  })
  describe('find', () => {
    it('should load child relations if passed in options', async () => {
      const billingAddress = new AddressBE()
      billingAddress.line1 = 'line1'
      billingAddress.line2 = 'line2'
      billingAddress.country = 'FR'

      let order = new OrderBE()
      order.reference = '123'
      order.state = OrderState.PENDING
      order.customer = { id: 1 }
      order.billingAddress = billingAddress

      order = await orderDAO.save(order)


      let order2 = new OrderBE()
      order2.reference = '2'
      order2.state = OrderState.PENDING
      order2.customer = { id: 1 }
      order2.billingAddress = order.billingAddress
      order2 = await orderDAO.save(order2)

      const results = await orderDAO.find(undefined, { options: ['billingAddress.orders'] })
      expect(results).toHaveLength(2)

      const result1 = results[0]
      expect(result1).toBeDefined()
      expect(result1.billingAddress).toBeDefined()
      expect(result1.billingAddress.orders).toBeDefined()
      expect(result1.billingAddress.orders).toHaveLength(2)

      const result2 = results[1]
      expect(result2).toBeDefined()
      expect(result2.billingAddress).toBeDefined()
      expect(result2.billingAddress.orders).toBeDefined()
      expect(result2.billingAddress.orders).toHaveLength(2)
    })
  })

  describe('findOne', () => {
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

      const result = await orderDAO.findOne({ reference: '123' })

      expect(result).toBeDefined()
      expect(result!.orderLinesWithoutRelation).toBeDefined()
      expect(result!.orderLinesWithoutRelation).toHaveLength(2)
      expect(result!.orderLinesWithoutRelation).toContainObjectLike({ product: expect.objectContaining({ label: 'product 2' }) })
      expect(result!.orderLinesWithoutRelation).toContainObjectLike({ product: expect.objectContaining({ label: 'product 3' }) })
    })
  })

  describe('findById', () => {
    it('should load lazy relations when in options', async () => {
      let order = new OrderBE()
      order.reference = '123'
      order.state = OrderState.PENDING
      order.customer = { id: 1 }
      order.billingAddressLazy = {
        line1: 'line1',
        line2: 'line2',
        country: 'FR',
      }
      order = await orderDAO.save(order)

      const result = await orderDAO.findById(order.id!, { options: ['billingAddressLazy'] })

      expect(result).toBeDefined()
      expect(result!.billingAddressLazy).toBeDefined()
      expect(result!.billingAddressLazy!.line1).toEqual('line1')
      expect(result!.billingAddressLazy!.line2).toEqual('line2')
      expect(result!.billingAddressLazy!.country).toEqual('FR')
    })
  })


})