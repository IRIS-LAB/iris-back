import { Controller, Get, HttpCode, HttpStatus, INestApplication, Post, Put } from '@nestjs/common'
import '@u-iris/iris-common-test-utils'
import request from 'supertest'
import { BodyParam, NumberPathParam } from '../../../../../src/decorators'
import {
  ErrorProvider,
  IrisModule,
  PaginatedListResult,
  PaginatedResources,
  Resource,
} from '../../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { OrderBE } from '../../../../commons/objects/business/be/OrderBE'
import { TestUtils } from '../../../../commons/test.utils'

@Controller('/orders')
class DefaultEBS {

  private static listOrders(): OrderBE[] {
    return [
      {
        id: 1,
        reference: 'REF1',
        billingAddress: {
          id: 1,
          line1: 'address 1',
          country: 'France',
        },
        customer: {
          id: 1,
          name: 'customer 1',
        },
        orderLines: [
          {
            id: 1,
            quantity: 1,
            product: {
              id: 1,
              label: 'product 1',
              amount: 4.99,
            },
          },
        ],
      },
    ].map(DefaultEBS.calculateAmount)
  }

  private static calculateAmount(order: OrderBE): OrderBE {
    order.orderLines.forEach(line => line.amount = line.product.amount * line.quantity)
    order.amount = order.orderLines.map(line => line.amount).reduce((amount, current) => amount! + current!, 0)!
    return order
  }

  constructor(private readonly errorProvider: ErrorProvider) {
  }

  @Get('/:id')
  @Resource(OrderBE)
  public async get(@NumberPathParam('id') id: number): Promise<OrderBE> {
    const order = DefaultEBS.listOrders().find(c => c.id === id)
    if (!order) {
      throw this.errorProvider.createEntityNotFoundBusinessException('orders', id)
    }
    return order
  }

  @Post('/')
  @Resource(OrderBE)
  public async save(@BodyParam() order: OrderBE): Promise<OrderBE> {
    return order
  }

  @Post('/status')
  @Resource(OrderBE)
  @HttpCode(HttpStatus.RESET_CONTENT)
  public async saveWithStatus(@BodyParam() order: OrderBE): Promise<OrderBE> {
    return order
  }

  @Put('/statusEmpty')
  @Resource()
  @HttpCode(HttpStatus.RESET_CONTENT)
  public async saveEmptyWithStatus(@BodyParam() order: OrderBE): Promise<void> {
    return undefined
  }

  @Get('/')
  @PaginatedResources(OrderBE, 'orders', 10, 100)
  public async index(@NumberPathParam('id') id: number): Promise<PaginatedListResult<OrderBE>> {
    const orders = DefaultEBS.listOrders()
    return { list: orders, count: orders.length }
  }
}

describe('RelationOptionsInterceptor', () => {
  let app: INestApplication

  beforeAll(async () => {
    const bootstraped = await TestUtils.bootstrapNestJS({
      imports: [
        IrisModule.forRoot(irisModuleOptionsForTests),
      ],
      controllers: [
        DefaultEBS,
      ],
      providers: [],
    })

    app = bootstraped.app
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    TestUtils.cleanApplication()
  })

  it('should return result with default parameters', () => {
    return request(app.getHttpServer())
      .get('/orders/1')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual({
            id: 1,
            reference: 'REF1',
            amount: 4.99,
            billingAddress: {
              id: 1,
              line1: 'address 1',
              country: 'France',
            },
            orderLines: [
              {
                id: 1,
              },
            ],
            customer: {
              id: 1,
            },
          },
        )
      })
  })

  it('should return result with option orderLines', () => {
    return request(app.getHttpServer())
      .get('/orders/1?options=orderLines')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual({
            id: 1,
            reference: 'REF1',
            amount: 4.99,
            billingAddress: {
              id: 1,
              line1: 'address 1',
              country: 'France',
            },
            orderLines: [
              {
                id: 1,
                quantity: 1,
                amount: 4.99,
                product: {
                  id: 1,
                },
              },
            ],
            customer: {
              id: 1,
            },
          },
        )
      })
  })

  it('should return result with option orderLines.product', () => {
    return request(app.getHttpServer())
      .get('/orders/1?options=orderLines.product')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual({
            id: 1,
            reference: 'REF1',
            amount: 4.99,
            billingAddress: {
              id: 1,
              line1: 'address 1',
              country: 'France',
            },
            orderLines: [
              {
                id: 1,
                quantity: 1,
                amount: 4.99,
                product: {
                  id: 1,
                  label: 'product 1',
                  amount: 4.99,
                },
              },
            ],
            customer: {
              id: 1,
            },
          },
        )
      })
  })

  it('should return results with default parameters', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual([{
            id: 1,
            reference: 'REF1',
            amount: 4.99,
            billingAddress: {
              id: 1,
              line1: 'address 1',
              country: 'France',
            },
            orderLines: [
              {
                id: 1,
              },
            ],
            customer: {
              id: 1,
            },
          }],
        )
      })
  })

  it('should return default http code', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .expect(201)
  })

  it('should return specific http code for post', () => {
    return request(app.getHttpServer())
      .post('/orders/status')
      .expect(HttpStatus.RESET_CONTENT)
  })
  it('should return specific http code for empty response', () => {
    return request(app.getHttpServer())
      .put('/orders/statusEmpty')
      .expect(HttpStatus.RESET_CONTENT)
  })
})
