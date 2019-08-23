import { Controller, Delete, INestApplication, Post, Put } from '@nestjs/common'
import '@u-iris/iris-common-test-utils'
import request from 'supertest'
import { PathParam } from '../../../../../src/decorators'
import { IrisModule, Resource } from '../../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { TestUtils } from '../../../../commons/test.utils'

class OrderBE {
  public id: number
  public name: string
}

@Controller('/orders')
class OrderEBS {

  @Post('/')
  @Resource(OrderBE)
  public async create(): Promise<OrderBE> {
    return {
      id: 5,
      name: 'name',
    }
  }

  @Put('/:id')
  @Resource(OrderBE)
  public async update(@PathParam('id') id: number): Promise<OrderBE> {
    return {
      id,
      name: 'name',
    }
  }

  @Put('/:id/nocontent')
  @Resource()
  public async updateWithoutContent(@PathParam('id') id: number): Promise<void> {
  }

  @Delete('/:id')
  @Resource()
  public async delete(@PathParam('id') id: number): Promise<void> {
  }
}

describe('@Resource', () => {
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

  it('should return HTTP status 201 for create', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .expect(201)
      .expect((response) => {
        expect(response.body).toBeDefined()
      })
  })

  it('should return HTTP status 200 for update', () => {
    return request(app.getHttpServer())
      .put('/orders/1')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
      })
  })

  it('should return HTTP status 204 for update without content', () => {
    return request(app.getHttpServer())
      .put('/orders/1/nocontent')
      .expect(204)
      .expect((response) => {
        expect(response.body).toBeDefined()
      })
  })

  it('should return HTTP status 204 for delete without content', () => {
    return request(app.getHttpServer())
      .delete('/orders/1')
      .expect(204)
      .expect((response) => {
        expect(response.body).toBeDefined()
      })
  })
})
