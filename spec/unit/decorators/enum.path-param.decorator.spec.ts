import { Controller, Get, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { EnumPathParam } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'

enum DefaultEnumAsInt {
  VAL1 = 0,
  VAL2 = 1
}

enum DefaultEnumAsString {
  VAL1 = 'VAL1',
  VAL2 = 'VAL2'
}

@Controller('/default')
class DefaultEBS {

  @Get('/enumAsInt/:filter')
  public getEnumAsInt(@EnumPathParam({
    type: DefaultEnumAsInt,
    key: 'filter',
  }) filter: DefaultEnumAsInt) {
    return { filter }
  }

  @Get('/enumAsString/:filter')
  public getEnumAsString(@EnumPathParam({
    type: DefaultEnumAsString,
    key: 'filter',
  }) filter: DefaultEnumAsString) {
    return { filter }
  }
}

describe('@EnumPathParam', () => {
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

  describe('as int', () => {

    it('should return error with code = type.wrong and field = filter', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsInt/15')
        .expect(400)
        .expect(response => {
          TestUtils.expectErreurReturned(response, { field: 'filter', code: 'parameter.type.invalid' })
        })
    })
    it('should return result with filter value', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsInt/' + DefaultEnumAsInt.VAL1)
        .expect(200)
        .expect(response => {
          expect(response.body).toEqual({ filter: DefaultEnumAsInt.VAL1 })
        })

    })
  })

  describe('as string', () => {
    it('should return error with code = type.wrong and field = filter', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsString/BAD')
        .expect(400)
        .expect(response => {
          TestUtils.expectErreurReturned(response, { field: 'filter', code: 'parameter.type.invalid' })
        })
    })
    it('should return result with filter value', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsString/' + DefaultEnumAsString.VAL2)
        .expect(200)
        .expect(response => {
          expect(response.body).toEqual({ filter: DefaultEnumAsString.VAL2 })
        })

    })
  })

})
