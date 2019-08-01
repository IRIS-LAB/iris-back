import { Controller, Get, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { StringPathParam } from '../../../src/decorators/string.path-param.decorator'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'


@Controller('/default')
class DefaultEBS {

  @Get('/:name')
  public getDate(@StringPathParam('name') name: string) {
    return { success: true, name }
  }
}

describe('@StringPathParam', () => {
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

  it('should return success with id', () => {
    return request(app.getHttpServer())
      .get('/default/myname')
      .expect(200)
      .expect(response => {
        expect(response.body).toEqual({ success: true, name: 'myname' })
      })
  })
})
