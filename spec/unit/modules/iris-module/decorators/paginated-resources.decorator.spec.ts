import { Controller, Get, INestApplication } from '@nestjs/common'
import '@u-iris/iris-common-test-utils'
import request from 'supertest'
import { IrisModule, PaginatedListResult, PaginatedResources } from '../../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { TestUtils } from '../../../../commons/test.utils'

class OrderBE {
  public id: number
  public name: string
}

@Controller('/orders')
class OrderEBS {

  @Get('/')
  @PaginatedResources(OrderBE, 'orders', 10, 100)
  public async search(): Promise<PaginatedListResult<OrderBE>> {
    return {
      list: [{ id: 1, name: 'name1' }, { id: 2, name: 'name2' }],
      count: 2,
    }
  }
}

describe('@PaginatedResources', () => {
  let app: INestApplication

  beforeAll(async () => {
    const bootstraped = await TestUtils.bootstrapNestJS({
      imports: [
        IrisModule.forRoot(irisModuleOptionsForTests),
      ],
      controllers: [
        OrderEBS,
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

  it('should return results with resource extracted from path', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.header['accept-range']).toEqual('orders 100')
      })
  })
})
