import { Controller, Get, INestApplication } from '@nestjs/common'
import request from 'supertest'
import { EnumQueryParam } from '../../../src/decorators'
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

  @Get('/enumAsInt')
  public getEnumAsInt(@EnumQueryParam({
    type: DefaultEnumAsInt,
    key: 'filter',
    required: true,
  }) filter: DefaultEnumAsInt) {
    return { filter }
  }

  @Get('/enumAsString')
  public getEnumAsString(@EnumQueryParam({
    type: DefaultEnumAsString,
    key: 'filter',
    required: true,
  }) filter: DefaultEnumAsString) {
    return { filter }
  }
}

describe('@EnumQueryParam', () => {
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

    it('should return error with codeErreur = parameter.required and champErreur = filter', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsInt')
        .expect(400)
        .expect(response => {
          TestUtils.expectErreurReturned(response, { champErreur: 'filter', codeErreur: 'parameter.required' })
        })
    })
    it('should return error with codeErreur = type.wrong and champErreur = filter', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsInt?filter=15')
        .expect(400)
        .expect(response => {
          TestUtils.expectErreurReturned(response, { champErreur: 'filter', codeErreur: 'parameter.type.invalid' })
        })
    })
    it('should return result with filter value', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsInt?filter=' + DefaultEnumAsInt.VAL1)
        .expect(200)
        .expect(response => {
          expect(response.body).toEqual({ filter: DefaultEnumAsInt.VAL1 })
        })

    })
  })

  describe('as string', () => {

    it('should return error with codeErreur = parameter.required and champErreur = filter', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsString')
        .expect(400)
        .expect(response => {
          TestUtils.expectErreurReturned(response, { champErreur: 'filter', codeErreur: 'parameter.required' })
        })
    })
    it('should return error with codeErreur = type.wrong and champErreur = filter', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsString?filter=BAD')
        .expect(400)
        .expect(response => {
          TestUtils.expectErreurReturned(response, { champErreur: 'filter', codeErreur: 'parameter.type.invalid' })
        })
    })
    it('should return result with filter value', () => {
      return request(app.getHttpServer())
        .get('/default/enumAsString?filter=' + DefaultEnumAsString.VAL2)
        .expect(200)
        .expect(response => {
          expect(response.body).toEqual({ filter: DefaultEnumAsString.VAL2 })
        })

    })
  })

})
