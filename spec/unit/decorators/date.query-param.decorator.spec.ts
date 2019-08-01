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

  it('should return error with codeErreur = parameter.required and champErreur = filter', () => {
    return request(app.getHttpServer())
      .get('/default/date')
      .expect(400)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { champErreur: 'filter', codeErreur: 'parameter.required' })
      })
  })
  it('should return error with codeErreur = type.wrong and champErreur = filter', () => {
    return request(app.getHttpServer())
      .get('/default/date?filter=BAD')
      .expect(400)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { champErreur: 'filter', codeErreur: 'type.date.wrong' })
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
})
