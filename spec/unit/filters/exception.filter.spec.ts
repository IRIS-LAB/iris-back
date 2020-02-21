import { Controller, Get, INestApplication } from '@nestjs/common'
import { BusinessException, ErrorDO } from '@u-iris/iris-common'
import request from 'supertest'
import { StringPathParam } from '../../../src/decorators'
import { IrisModule } from '../../../src/modules/iris-module'
import { ErrorService } from '../../../src/modules/iris-module/services'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'

@Controller('/default')
class DefaultEBS {

  constructor(private readonly errorProvider: ErrorService) {

  }

  @Get('/business')
  public businessException() {
    throw new BusinessException(new ErrorDO('field', 'code', 'message'))
  }

  @Get('/entity/:id')
  public entityNotFound(@StringPathParam('id') id: number) {
    throw this.errorProvider.createEntityNotFoundBusinessException('entity', id)
  }

  @Get('/technical')
  public technical() {
    throw this.errorProvider.createTechnicalException('field', 'code', new Error())
  }

  @Get('/security')
  public security() {
    throw this.errorProvider.createSecurityException('token', 'invalid')
  }

  @Get('/auth')
  public auth() {
    throw this.errorProvider.createSecurityException('token', 'security.authentication')
  }
}

describe('Exception filter', () => {
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

  it('should return error 404 because of no route found', () => {
    return request(app.getHttpServer())
      .get('/unknown')
      .expect(404)
      .expect(response => {
        TestUtils.expectErreurReturned(response, {
          field: '',
          code: 'error',
          label: 'Cannot GET /unknown',
        })
      })
  })
  it('should return error 404 because of entity not found', () => {
    return request(app.getHttpServer())
      .get('/default/entity/5')
      .expect(404)
      .expect(response => {
        TestUtils.expectErreurReturned(response, {
          field: 'entity',
          code: 'entity.not.found',
          label: 'Cannot get entity entity with id 5',
        })
      })
  })
  it('should return error 400 because of business exception', () => {
    return request(app.getHttpServer())
      .get('/default/business')
      .expect(400)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { field: 'field', code: 'code' })
      })
  })
  it('should return error 500 because of technical exception', () => {
    return request(app.getHttpServer())
      .get('/default/technical')
      .expect(500)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { field: 'field', code: 'code' })
      })
  })
  it('should return error 403 because of security exception', () => {
    return request(app.getHttpServer())
      .get('/default/security')
      .expect(403)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { field: 'token', code: 'invalid' })
      })
  })
  it('should return error 401 because of security exception', () => {
    return request(app.getHttpServer())
      .get('/default/auth')
      .expect(401)
      .expect(response => {
        TestUtils.expectErreurReturned(response, { field: 'token', code: 'security.authentication' })
      })
  })
})
