import { Controller, INestApplication, Post } from '@nestjs/common'
import request from 'supertest'
import { BodyParam } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { CommandBE } from '../../commons/objects/business/be/CommandBE'
import { TestUtils } from '../../commons/test.utils'

@Controller('/default')
class DefaultEBS {

  @Post('/')
  public getDate(@BodyParam() object: CommandBE) {
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
    const command: CommandBE = {
      amount: 5,
      billingAddress: {
        line1: 'line1',
        country: 'FRANCE',
      },
      commandLines: [],
      customer: {
        id: 45,
      },
      reference: 'REF.1',

    }
    return request(app.getHttpServer())
      .post('/default')
      .send(command)
      .expect(201)
      .expect(response => {
        expect(response.body).toEqual({
            amount: 5,
            billingAddress: {
              line1: 'line1',
              country: 'FRANCE',
            },
            commandLines: [],
            customer: {
              id: 45,
            },
            reference: 'REF.1',

          },
        )
      })
  })
})
