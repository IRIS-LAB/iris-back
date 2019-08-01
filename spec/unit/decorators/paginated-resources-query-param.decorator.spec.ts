import { Controller, Get, INestApplication } from '@nestjs/common'
import '@u-iris/iris-common-test-utils'
import request from 'supertest'
import { PaginatedResourcesQueryParam } from '../../../src/decorators'
import { PaginatedResourcesOptions } from '../../../src/interfaces'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'

@Controller('/queryable')
class DefaultEBS {

  @Get('/list')
  public async index(@PaginatedResourcesQueryParam() queryableListParam: PaginatedResourcesOptions): Promise<PaginatedResourcesOptions> {

    return queryableListParam
  }
}

describe('@PaginatedResourcesQueryParam', () => {
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

  it('should return queryable list param with default params', () => {
    return request(app.getHttpServer())
      .get('/queryable/list')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual({
          options: null,
          paginate: {
            page: 0,
            size: 20
          },
          sort: []
        })
      })
  })
})
