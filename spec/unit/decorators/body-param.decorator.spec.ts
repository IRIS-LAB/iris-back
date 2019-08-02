import { Controller, INestApplication, Injectable, Post } from '@nestjs/common'
import { BusinessValidator } from '@u-iris/iris-common'
import request from 'supertest'
import { Joi } from 'tsdv-joi/core'
import { BodyParam } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { CommandBE } from '../../commons/objects/business/be/CommandBE'
import { TestUtils } from '../../commons/test.utils'

class TestDateBE {
  @BusinessValidator(Joi.date())
  public date: Date
}

@Injectable()
class DefaultLBS {
  public async assertDate(object: TestDateBE): Promise<TestDateBE> {
    return object
  }
}

@Controller('/default')
class DefaultEBS {

  constructor(private readonly defaultLBS: DefaultLBS) {

  }

  @Post('/')
  public getDate(@BodyParam() object: CommandBE) {
    return object
  }

  @Post('/assertDate')
  public assertDate(@BodyParam() object: TestDateBE): Promise<TestDateBE> {
    return this.defaultLBS.assertDate(object)
  }
}

describe('@BodyParam', () => {
  let app: INestApplication
  let defaultLBS: DefaultLBS

  beforeAll(async () => {
    const bootstraped = await TestUtils.bootstrapNestJS({
      imports: [
        IrisModule.forRoot(irisModuleOptionsForTests),
      ],
      controllers: [
        DefaultEBS,
      ],
      providers: [DefaultLBS],
    })

    app = bootstraped.app
    defaultLBS = bootstraped.module.get<DefaultLBS>(DefaultLBS)
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

  it('should serialize typeof Date', () => {
    const date = new Date()
    jest.spyOn(defaultLBS, 'assertDate').mockImplementation(async (object: TestDateBE) => {
      expect(object).toBeDefined()
      expect(object.date).toBeDefined()
      expect(object.date).toBeInstanceOf(Date)
      return object
    })

    return request(app.getHttpServer())
      .post('/default/assertDate')
      .send({ date: date.toISOString() })
      .expect(201)
      .expect(response => {
        expect(response.body).toEqual({
            date: date.toISOString(),
          },
        )
      })
  })
})
