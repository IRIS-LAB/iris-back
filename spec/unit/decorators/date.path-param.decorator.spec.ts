import { Controller, Get, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { DatePathParam } from '../../../src/decorators/date.path-param.decorator'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'


@Controller('/default')
class DefaultEBS {

  @Get('/:date')
  public getDate(@DatePathParam('date') date: Date) {
    return { success: true, date }
  }
}

describe('@DatePathParam', () => {
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

  it('should return success with date', () => {
    return request(app.getHttpServer())
      .get('/default/2019-07-31T10:05:15Z')
      .expect(200)
      .expect(response => {
        expect(response.body).toEqual({ success: true, date: '2019-07-31T10:05:15.000Z' })
      })
  })
})
