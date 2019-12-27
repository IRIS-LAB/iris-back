import { Controller, Get, INestApplication } from '@nestjs/common'
import '@u-iris/iris-common-test-utils'
import request from 'supertest'
import { PaginatedEntitiesQueryParam } from '../../../../../src/decorators'
import { PaginatedEntitiesOptions } from '../../../../../src/interfaces'
import { IrisModule, PaginatedListResult, PaginatedResources } from '../../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { TestUtils } from '../../../../commons/test.utils'

@Controller('/number')
class DefaultEBS {

  @Get('/')
  @PaginatedResources(Number, 'numbers', 10, 100)
  public async index(@PaginatedEntitiesQueryParam() queryableListParam: PaginatedEntitiesOptions): Promise<PaginatedListResult<number>> {
    const numbersInDatabase = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    const results = numbersInDatabase.slice(queryableListParam.paginate!.size * queryableListParam.paginate!.page, queryableListParam.paginate!.size * queryableListParam.paginate!.page + queryableListParam.paginate!.size)
    return { list: results, count: numbersInDatabase.length }
  }
}

describe('Pagination interceptor', () => {
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

  it('should return results with default parameters', () => {
    return request(app.getHttpServer())
      .get('/number')
      .expect(206)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toBeInstanceOf(Array)
        expect(response.body).toHaveLength(10)
        expect(response.body).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        expect(response.header['accept-range']).toEqual('number 100')
        expect(response.header['content-range']).toEqual('0-9/16')
        expect(response.header['x-page-element-count']).toEqual('10')
        expect(response.header['x-total-element']).toEqual('16')
        expect(response.header['x-total-page']).toEqual('2')
      })
  })
  it('should return results with parameters in query for page 0', () => {
    return request(app.getHttpServer())
      .get('/number?page=0&size=5')
      .expect(206)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toBeInstanceOf(Array)
        expect(response.body).toHaveLength(5)
        expect(response.body).toEqual([1, 2, 3, 4, 5])
        expect(response.header['accept-range']).toEqual('number 100')
        expect(response.header['content-range']).toEqual('0-4/16')
        expect(response.header['x-page-element-count']).toEqual('5')
        expect(response.header['x-total-element']).toEqual('16')
        expect(response.header['x-total-page']).toEqual('4')
      })
  })
  it('should return results with parameters in query for page 2', () => {
    return request(app.getHttpServer())
      .get('/number?page=2&size=5')
      .expect(206)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toBeInstanceOf(Array)
        expect(response.body).toHaveLength(5)
        expect(response.body).toEqual([11, 12, 13, 14, 15])
        expect(response.header['accept-range']).toEqual('number 100')
        expect(response.header['content-range']).toEqual('10-14/16')
        expect(response.header['x-page-element-count']).toEqual('5')
        expect(response.header['x-total-element']).toEqual('16')
        expect(response.header['x-total-page']).toEqual('4')
      })
  })
  it('should return all results with headers', () => {
    return request(app.getHttpServer())
      .get('/number?size=50')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toBeInstanceOf(Array)
        expect(response.body).toHaveLength(16)
        expect(response.body).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
        expect(response.header['accept-range']).toEqual('number 100')
        expect(response.header['content-range']).toEqual('0-15/16')
        expect(response.header['x-page-element-count']).toEqual('16')
        expect(response.header['x-total-element']).toEqual('16')
        expect(response.header['x-total-page']).toEqual('1')
      })
  })
  it('should return error cause of size exceeded', () => {
    return request(app.getHttpServer())
      .get('/number?size=101')
      .expect(400)
      .expect((response) => {
        TestUtils.expectErreurReturned(response, { field: 'size', code: 'max.exceeded' })
      })
  })
  it('should return error cause of negative size', () => {
    return request(app.getHttpServer())
      .get('/number?size=-1')
      .expect(400)
      .expect((response) => {
        TestUtils.expectErreurReturned(response, { field: 'size', code: 'min.exceeded' })
      })
  })
})
