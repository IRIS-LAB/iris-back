import { Controller, Get, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { NumberQueryParam } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'

@Controller('/default')
class DefaultEBS {

  @Get('/number')
  public getNumber(@NumberQueryParam({ key: 'filter', required: true }) filter: number) {
    return { filter }
  }

}

describe('@NumberQueryParam', () => {
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
      .get('/default/number')
      .expect(400)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { field: 'filter', code: 'parameter.required' })
      })
  })

  it('should return error with code = type.wrong and field = filter', () => {
    return request(app.getHttpServer())
      .get('/default/number?filter=fd')
      .expect(400)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { field: 'filter', code: 'type.number.invalid' })
      })
  })

  it('should return result with filter value', () => {
    return request(app.getHttpServer())
      .get('/default/number?filter=5')
      .expect(200)
      .expect(response => {
        expect(response.body).toEqual({ filter: 5 })
      })
  })
})
