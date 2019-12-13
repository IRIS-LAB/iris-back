import { Controller, INestApplication, Injectable, Post } from '@nestjs/common'
import request from 'supertest'
import { BodyParam, jf, ReadOnly } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { OrderBE } from '../../commons/objects/business/be/OrderBE'
import { TestUtils } from '../../commons/test.utils'

class TestDateBE {
  @jf.date()
  public date: Date
}

class TestReadonlyBE {
  @jf.string()
  public name: string

  @jf.string()
  @ReadOnly()
  public hiddenField: string
}

@Injectable()
class DefaultLBS {
  public async assertDate(object: TestDateBE): Promise<TestDateBE> {
    return object
  }

  public async assertReadOnly(object: TestReadonlyBE): Promise<TestReadonlyBE> {
    return object
  }

  public async assertList(list: TestReadonlyBE[]): Promise<TestReadonlyBE[]> {
    return list
  }

  public async assertRelationEntity(order: OrderBE): Promise<OrderBE> {
    return order
  }

}

@Controller('/default')
class DefaultEBS {

  constructor(private readonly defaultLBS: DefaultLBS) {

  }

  @Post('/')
  public getDate(@BodyParam() object: OrderBE) {
    return object
  }

  @Post('/assertDate')
  public assertDate(@BodyParam() object: TestDateBE): Promise<TestDateBE> {
    return this.defaultLBS.assertDate(object)
  }

  @Post('/assertList')
  public async assertList(@BodyParam(TestReadonlyBE) list: TestReadonlyBE[]): Promise<TestReadonlyBE[]> {
    return this.defaultLBS.assertList(list)
  }

  @Post('/assertReadOnly')
  public assertReadOnly(@BodyParam() object: TestReadonlyBE): Promise<TestReadonlyBE> {
    return this.defaultLBS.assertReadOnly(object)
  }

  @Post('/assertRelationEntity')
  public assertRelationEntity(@BodyParam() order: OrderBE): Promise<OrderBE> {
    return this.defaultLBS.assertRelationEntity(order)
  }
}

describe('@BodyParam', () => {
  let app: INestApplication
  let defaultLBS: DefaultLBS

  beforeAll(async () => {
    const bootstraped = await TestUtils.bootstrapNestJS({
      imports: [
        IrisModule.forRoot(irisModuleOptionsForTests),
      ],
      controllers: [
        DefaultEBS,
      ],
      providers: [DefaultLBS],
    })

    app = bootstraped.app
    defaultLBS = bootstraped.module.get<DefaultLBS>(DefaultLBS)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    TestUtils.cleanApplication()
  })

  it('should return body as sent', () => {
    const order: OrderBE = {
      amount: 5,
      billingAddress: {
        line1: 'line1',
        country: 'FRANCE',
      },
      orderLines: [],
      customer: {
        id: 45,
      },
      reference: 'REF.1',

    }
    return request(app.getHttpServer())
      .post('/default')
      .send(order)
      .expect(201)
      .expect(response => {
        expect(response.body).toEqual({
            amount: 5,
            billingAddress: {
              line1: 'line1',
              country: 'FRANCE',
            },
            orderLines: [],
            customer: {
              id: 45,
            },
            reference: 'REF.1',

          },
        )
      })
  })

  it('should serialize typeof Date', () => {
    const date = new Date()
    jest.spyOn(defaultLBS, 'assertDate').mockImplementation(async (object: TestDateBE) => {
      expect(object).toBeDefined()
      expect(object.date).toBeDefined()
      expect(object.date).toBeInstanceOf(Date)
      return object
    })

    return request(app.getHttpServer())
      .post('/default/assertDate')
      .send({ date: date.toISOString() })
      .expect(201)
      .expect(response => {
        expect(response.body).toEqual({
            date: date.toISOString(),
          },
        )
      })
  })

  it('should avoid @ReadOnly fields', () => {
    jest.spyOn(defaultLBS, 'assertReadOnly').mockImplementation(async (object: TestReadonlyBE) => {
      expect(object).toBeDefined()
      expect(object.name).toBeDefined()
      expect(object.hiddenField).not.toBeDefined()
      return object
    })

    return request(app.getHttpServer())
      .post('/default/assertReadOnly')
      .send({ name: 'name', hiddenField: 'hidden' })
      .expect(201)
      .expect(response => {
        expect(response.body).toEqual({
            name: 'name',
          },
        )
      })
  })

  it('should serialize list', () => {
    jest.spyOn(defaultLBS, 'assertList').mockImplementation(async (list: TestReadonlyBE[]) => {
      expect(list).toBeDefined()
      expect(list).toBeInstanceOf(Array)
      expect(list).toHaveLength(2)
      expect(list).toContainEqual({ name: 'name1' })
      expect(list).toContainEqual({ name: 'name2' })
      return list
    })

    return request(app.getHttpServer())
      .post('/default/assertList')
      .send([{ name: 'name1' }, { name: 'name2' }])
      .expect(201)
      .expect(response => {
        expect(response.body).toEqual([
            {
              name: 'name1',
            },
            {
              name: 'name2',
            },
          ],
        )
      })

  })

  it('should serialize ENTITY relation', () => {
    jest.spyOn(defaultLBS, 'assertRelationEntity').mockImplementation(async (order: OrderBE) => {
      expect(order).toBeDefined()
      expect(order.id).not.toBeDefined()
      expect(order.orderLinesEntities).toBeDefined()
      expect(order.orderLinesEntities).toBeDefined()
      for (const orderLine of order.orderLinesEntities!) {
        expect(orderLine).toBeDefined()
        expect(orderLine.id).toBeDefined()
        expect(orderLine.quantity).toBeDefined()
        expect(orderLine.product).toBeDefined()
        expect(orderLine.product.id).toBeDefined()
        expect(orderLine.product.label).not.toBeDefined()
        expect(orderLine.product.amount).not.toBeDefined()
      }
      return order
    })

    return request(app.getHttpServer())
      .post('/default/assertRelationEntity')
      .send({
        id: 45,
        orderLinesEntities: [
          {
            id: 1,
            quantity: 2,
            product: {
              id: 1,
              label: 'product',
              amount: 5,
            }
          },
          {
            id: 2,
            quantity: 1,
            product: {
              id: 2,
              label: 'product 1',
              amount: 10,
            }
          },
        ],
      })
      .expect(201)
      .expect(response => {
        expect(response.body).toBeDefined()
      })

  })
})
