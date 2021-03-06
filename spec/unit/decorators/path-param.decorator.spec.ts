import { Controller, Get, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { PathParam } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'


@Controller('/default')
class DefaultEBS {

  @Get('/:id')
  public getDate(@PathParam('id', {transform: (value: string) => parseInt(value)}) id: number) {
    return { success: true, id }
  }
}

describe('@PathParam', () => {
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
      .get('/default/5')
      .expect(200)
      .expect(response => {
        expect(response.body).toEqual({ success: true, id: 5 })
      })
  })
})
