import { Controller, Get, INestApplication, Injectable } from '@nestjs/common'
import '@u-iris/iris-common-test-utils'
import request from 'supertest'
import { PaginatedEntitiesQueryParam } from '../../../../../src/decorators'
import { PaginatedEntitiesOptions } from '../../../../../src/interfaces'
import { enableCors } from '../../../../../src/middlewares/cors.middleware'
import { IrisModule, PaginatedListResult, PaginatedResources } from '../../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { TestUtils } from '../../../../commons/test.utils'

class OrderBE {
  public id: number
  public name: string
}

const createOrder = (id: number): OrderBE => {
  return { id, name: 'order ' + id }
}
const createOrders = (count: number): OrderBE[] => {
  const array: OrderBE[] = []
  for (let i = 0; i < count; i++) {
    array.push(createOrder(i))
  }
  return array
}

@Injectable()
class OrderLBS {
  public async findAndCount(): Promise<PaginatedListResult<OrderBE>> {
    return { list: [], count: 0 }
  }
}

@Controller('/orders')
class OrderEBS {

  constructor(private readonly orderLBS: OrderLBS) {

  }

  @Get('/')
  @PaginatedResources(OrderBE, 'orders', 10, 100)
  public async search(@PaginatedEntitiesQueryParam() paginatedParams: PaginatedEntitiesOptions): Promise<PaginatedListResult<OrderBE>> {
    return this.orderLBS.findAndCount()
  }
}

describe('@PaginatedResources', () => {
  let app: INestApplication
  let orderLBS: OrderLBS

  describe('generic response headers', () => {
    beforeAll(async () => {
      const bootstraped = await TestUtils.bootstrapNestJS({
        imports: [
          IrisModule.forRoot({ ...irisModuleOptionsForTests, enableCors: false }),
        ],
        controllers: [
          OrderEBS,
        ],
        providers: [
          OrderLBS,
        ],
      })

      app = bootstraped.app
      // app.use(enableCors())
      orderLBS = bootstraped.module.get<OrderLBS>(OrderLBS)
      await app.init()
    })

    afterAll(async () => {
      jest.clearAllMocks()
      await app.close()
      TestUtils.cleanApplication()
    })

    it('should return results with resource extracted from path', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .expect(200)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.header['accept-ranges']).toEqual('orders 100')
        })
    })

    it('should return status 206 for Partial Content', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })
      return request(app.getHttpServer())
        .get('/orders')
        .expect(206)
        .expect((response) => {
          expect(response.body).toBeDefined()
        })
    })

    it('should return header Accept-Ranges', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })
      return request(app.getHttpServer())
        .get('/orders')
        .expect(206)
        .expect((response) => {
          expect(response.header['accept-ranges']).toBeDefined()
          expect(response.header['accept-ranges']).toEqual('orders 100')
        })
    })

    it('should return header Content-Range', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })
      return request(app.getHttpServer())
        .get('/orders')
        .expect(206)
        .expect((response) => {
          expect(response.header['content-range']).toBeDefined()
          expect(response.header['content-range']).toEqual('0-9/120')
        })
    })

    it('should return header X-Page-Element-Count', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })
      return request(app.getHttpServer())
        .get('/orders')
        .expect(206)
        .expect((response) => {
          expect(response.header['x-page-element-count']).toBeDefined()
          expect(response.header['x-page-element-count']).toEqual('10')
        })
    })

    it('should return header X-Total-Element', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })
      return request(app.getHttpServer())
        .get('/orders')
        .expect(206)
        .expect((response) => {
          expect(response.header['x-total-element']).toBeDefined()
          expect(response.header['x-total-element']).toEqual('120')
        })
    })

    it('should return header X-Total-Page', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })
      return request(app.getHttpServer())
        .get('/orders')
        .expect(206)
        .expect((response) => {
          expect(response.header['x-total-page']).toBeDefined()
          expect(response.header['x-total-page']).toEqual('12')
        })
    })

    it('should return header Link for first page', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })
      return request(app.getHttpServer())
        .get('/orders?page=0')
        .expect(206)
        .expect((response) => {
          expect(response.header.link).toBeDefined()
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=1&size=10>; rel="next"/)
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=11&size=10>; rel="last"/)
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=0&size=10>; rel="first"/)
          expect(response.header.link).not.toMatch(/rel="prev"/)
        })
    })

    it('should return header Link for last page', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })
      return request(app.getHttpServer())
        .get('/orders?page=11')
        .expect(206)
        .expect((response) => {
          expect(response.header.link).toBeDefined()
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=10&size=10>; rel="prev"/)
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=11&size=10>; rel="last"/)
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=0&size=10>; rel="first"/)
          expect(response.header.link).not.toMatch(/rel="next"/)
        })
    })

    it('should return header Link for middle page', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })
      return request(app.getHttpServer())
        .get('/orders?page=5')
        .expect(206)
        .expect((response) => {
          expect(response.header.link).toBeDefined()
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=4&size=10>; rel="prev"/)
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=6&size=10>; rel="next"/)
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=11&size=10>; rel="last"/)
          expect(response.header.link).toMatch(/<([\w.:]*)\/orders\?page=0&size=10>; rel="first"/)
        })
    })

    it('should not return headers Access-Control-Allow-Origin and Access-Control-Expose-Headers for cors', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })

      return request(app.getHttpServer())
        .get('/orders?page=5')
        .expect(206)
        .expect((response) => {
          expect(response.header['access-control-allow-origin']).not.toBeDefined()
          expect(response.header['access-control-expose-headers']).not.toBeDefined()
        })
    })
  })

  describe('response headers for cors', () => {
    beforeAll(async () => {
      const bootstraped = await TestUtils.bootstrapNestJS({
        imports: [
          IrisModule.forRoot(irisModuleOptionsForTests),
        ],
        controllers: [
          OrderEBS,
        ],
        providers: [
          OrderLBS,
        ],
      })

      app = bootstraped.app
      app.use(enableCors())
      orderLBS = bootstraped.module.get<OrderLBS>(OrderLBS)
      await app.init()
    })

    it('should return headers Access-Control-Allow-Origin and Access-Control-Expose-Headers for cors', () => {
      jest.spyOn(orderLBS, 'findAndCount').mockImplementation(async () => {
        return {
          list: createOrders(10),
          count: 120,
        }
      })

      return request(app.getHttpServer())
        .get('/orders?page=5')
        .expect(206)
        .expect((response) => {
          expect(response.header['access-control-allow-origin']).toBeDefined()
          expect(response.header['access-control-allow-origin']).toEqual('*')
          expect(response.header['access-control-expose-headers']).toBeDefined()
          expect(response.header['access-control-expose-headers']).toEqual('Accept-Ranges,Content-Range,X-Page-Element-Count,X-Total-Element,X-Total-Page,Link')
        })
    })
  })
})
