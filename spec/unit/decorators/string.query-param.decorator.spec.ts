import { Controller, Get, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { StringQueryParam } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'

@Controller('/default')
class DefaultEBS {

  @Get('/string')
  public getString(@StringQueryParam({ key: 'filter', required: true }) filter: string) {
    return { filter }
  }

}

describe('@StringQueryParam', () => {
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

  it('should return error with code = parameter.required and field = filter', () => {
    return request(app.getHttpServer())
      .get('/default/string')
      .expect(400)
      .expect(response => {
        TestUtils.expectErreurReturned(response, {
          field: 'filter',
          code: 'parameter.required',
          label: 'Parameter filter is required',
        })
      })

  })
  it('should return result with filter value', () => {
    return request(app.getHttpServer())
      .get('/default/string?filter=value')
      .expect(200)
      .expect(response => {
        expect(response.body).toEqual({ filter: 'value' })
      })

  })
})
