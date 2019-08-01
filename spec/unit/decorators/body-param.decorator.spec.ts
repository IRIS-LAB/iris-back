import { Controller, INestApplication, Post } from '@nestjs/common'
import request from 'supertest'
import { BodyParam } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'

class ObjectBE {
  public id: number
  public name: string
}

@Controller('/default')
class DefaultEBS {

  @Post('/')
  public getDate(@BodyParam() object: ObjectBE) {
    return object
  }
}

describe('@BodyParam', () => {
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

  it('should return body as sent', () => {
    return request(app.getHttpServer())
      .post('/default')
      .send({
        id: 2501,
        name: 'name',
      })
      .expect(201)
      .expect(response => {
        expect(response.body).toEqual({ id: 2501, name: 'name' })
      })
  })
})
