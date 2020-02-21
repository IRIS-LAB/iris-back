import { Controller, Get, INestApplication, Injectable } from '@nestjs/common'
import * as e from 'express'
import request from 'supertest'
import { APP_AUTHORIZATION_SERVICE } from '../../../../../src/constants'
import {
  AuthenticatedUser,
  AuthenticationService,
  AuthorizationService,
  IrisModule,
  Secured,
} from '../../../../../src/modules/iris-module'
import { ClsService, DefaultAuthorizationService } from '../../../../../src/modules/iris-module/services'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { TestUtils } from '../../../../commons/test.utils'

@Injectable()
class TestAuthenticationService implements AuthenticationService {
  public async getAuthenticatedUser(req: e.Request): Promise<AuthenticatedUser | undefined> {
    return undefined
  }
}

@Injectable()
class TestAuthorizationService implements AuthorizationService {
  public async validateAuthorization(req: e.Request, ...functions: string[]): Promise<boolean> {
    return false
  }
}

@Controller('/')
class DefaultEBS {

  constructor(private readonly clsProvider: ClsService) {

  }

  @Get('/')
  @Secured('ROLE1', 'ROLE2')
  public async index(): Promise<string> {
    return 'OK'
  }

  @Get('/unsecured')
  public async unsecured(): Promise<string> {
    return 'OK'
  }

  @Get('/user')
  public async user(): Promise<AuthenticatedUser> {
    return this.clsProvider.getAuthenticatedUser()
  }

}

@Controller('/other')
@Secured('ROLE3')
class DefaultEBS2 {

  @Get('/')
  public async index(): Promise<string> {
    return 'OK'
  }

}


describe('AuthorizationService', () => {
  let app: INestApplication
  let authorizationService: AuthorizationService

  describe('with specific service', () => {
    beforeAll(async () => {
      const bootstraped = await TestUtils.bootstrapNestJS({
        imports: [
          IrisModule.forRoot({
            ...irisModuleOptionsForTests,
            authenticationProvider: TestAuthenticationService,
            authorizationProvider: TestAuthorizationService,
          }),
        ],
        controllers: [
          DefaultEBS,
          DefaultEBS2,
        ],
        providers: [],
      })
      // authenticationProvider = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
      authorizationService = bootstraped.module.get(APP_AUTHORIZATION_SERVICE)
      app = bootstraped.app
      await app.init()
    })

    afterAll(async () => {
      await app.close()
      TestUtils.cleanApplication()
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should inject TestAuthorizationService', () => {
      expect(authorizationService).toBeInstanceOf(TestAuthorizationService)
    })

    it('should authorize request without roles', () => {
      return request(app.getHttpServer())
        .get('/unsecured')
        .expect(200)
        .expect('OK')
    })

    it('should authorize request secured by roles', () => {
      jest.spyOn(authorizationService, 'validateAuthorization').mockImplementation(async () => true)

      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('OK')
    })

    it('should unauthorize request secured by roles', () => {
      jest.spyOn(authorizationService, 'validateAuthorization').mockImplementation(async () => false)

      return request(app.getHttpServer())
        .get('/')
        .expect(403)
    })
  })
  describe('with default provider', () => {
    beforeAll(async () => {
      const bootstraped = await TestUtils.bootstrapNestJS({
        imports: [
          IrisModule.forRoot(irisModuleOptionsForTests),
        ],
        controllers: [
          DefaultEBS,
          DefaultEBS2,
        ],
        providers: [],
      })
      // authenticationProvider = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
      authorizationService = bootstraped.module.get(APP_AUTHORIZATION_SERVICE)
      app = bootstraped.app
      await app.init()
    })

    afterAll(async () => {
      await app.close()
      TestUtils.cleanApplication()
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should inject DefaultAuthorizationService', () => {
      expect(authorizationService).toBeInstanceOf(DefaultAuthorizationService)
    })

    it('should authorize request without roles', () => {
      return request(app.getHttpServer())
        .get('/unsecured')
        .expect(200)
        .expect('OK')
    })

    it('should unauthorize request secured by roles', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(403)
    })

    it('should unauthorize request secured by roles on controller', () => {
      return request(app.getHttpServer())
        .get('/other')
        .expect(403)
    })
  })

})