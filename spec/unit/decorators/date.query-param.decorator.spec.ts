import { Controller, Get, INestApplication } from '@nestjs/common'
import moment from 'moment'
import request from 'supertest'
import { DateQueryParam } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'

@Controller('/default')
class DefaultEBS {

  @Get('/date')
  public getDate(@DateQueryParam({ key: 'filter', required: true }) filter: Date) {
    return { filter }
  }
}

describe('@DateQueryParam', () => {
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
      .get('/default/date')
      .expect(400)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { field: 'filter', code: 'parameter.required' })
      })
  })
  it('should return error with code = type.date.invalid and field = filter', () => {
    return request(app.getHttpServer())
      .get('/default/date?filter=BAD')
      .expect(400)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { field: 'filter', code: 'type.date.invalid' })
      })
  })
  it('should return result with filter value', () => {
    const date = moment()
    const formattedDate = date.toISOString()
    return request(app.getHttpServer())
      .get('/default/date?filter=' + formattedDate)
      .expect(200)
      .expect(response => {
        expect(response.body).toEqual({ filter: formattedDate })
        expect(moment(response.body.filter).toDate()).toEqual(date.toDate())
      })

  })

  it('should support timezone', () => {
    const formattedDate = "2020-02-21T10:00:00.000+01:00"
    const encodedDate = encodeURIComponent(formattedDate)
    return request(app.getHttpServer())
      .get('/default/date?filter=' + encodedDate)
      .expect(200)
      .expect(response => {
        expect(response.body).toEqual({ filter: "2020-02-21T09:00:00.000Z" })
      })

  })
})
