import { Controller, Get, INestApplication, Injectable } from '@nestjs/common'
import * as e from 'express'
import request from 'supertest'
import { APP_AUTHENTICATION_SERVICE, APP_AUTHORIZATION_SERVICE } from '../../../../../src/constants'
import {
  AuthenticatedUser,
  AuthenticationService,
  AuthorizationService,
  ClsProvider,
  IrisModule,
  Roles,
} from '../../../../../src/modules/iris-module'
import { DefaultAuthorizationProvider } from '../../../../../src/modules/iris-module/providers/default-authorization.provider'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { TestUtils } from '../../../../commons/test.utils'

@Injectable()
class TestAuthenticationProvider implements AuthenticationService {
  public async getAuthenticatedUser(req: e.Request): Promise<AuthenticatedUser | undefined> {
    return undefined
  }
}

@Injectable()
class TestAuthorizationProvider implements AuthorizationService {
  public async validateAuthorization(req: e.Request, ...functions: string[]): Promise<boolean> {
    return false
  }
}

@Controller('/')
class DefaultEBS {

  constructor(private readonly clsProvider: ClsProvider) {

  }

  @Get('/')
  @Roles('ROLE1', 'ROLE2')
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

describe('@Roles', () => {
  let app: INestApplication

  describe('authorizationProvider', () => {
    let authorizationProvider: AuthorizationService

    describe('with specific provider', () => {
      beforeAll(async () => {
        const bootstraped = await TestUtils.bootstrapNestJS({
          imports: [
            IrisModule.forRoot({
              ...irisModuleOptionsForTests,
              authenticationProvider: TestAuthenticationProvider,
              authorizationProvider: TestAuthorizationProvider,
            }),
          ],
          controllers: [
            DefaultEBS,
          ],
          providers: [],
        })
        // authenticationProvider = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
        authorizationProvider = bootstraped.module.get(APP_AUTHORIZATION_SERVICE)
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

      it('should inject TestAuthorizationProvider', () => {
        expect(authorizationProvider).toBeInstanceOf(TestAuthorizationProvider)
      })

      it('should authorize request without roles', () => {
        return request(app.getHttpServer())
          .get('/unsecured')
          .expect(200)
          .expect('OK')
      })

      it('should authorize request secured by roles', () => {
        jest.spyOn(authorizationProvider, 'validateAuthorization').mockImplementation(async () => true)

        return request(app.getHttpServer())
          .get('/')
          .expect(200)
          .expect('OK')
      })

      it('should unauthorize request secured by roles', () => {
        jest.spyOn(authorizationProvider, 'validateAuthorization').mockImplementation(async () => false)

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
          ],
          providers: [],
        })
        // authenticationProvider = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
        authorizationProvider = bootstraped.module.get(APP_AUTHORIZATION_SERVICE)
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

      it('should inject DefaultAuthorizationProvider', () => {
        expect(authorizationProvider).toBeInstanceOf(DefaultAuthorizationProvider)
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
    })

  })

  describe('authenticationProvider', () => {
    let authenticationProvider: AuthenticationService


    describe('with specific provider', () => {
      beforeAll(async () => {
        const bootstraped = await TestUtils.bootstrapNestJS({
          imports: [
            IrisModule.forRoot({
              ...irisModuleOptionsForTests,
              authenticationProvider: TestAuthenticationProvider,
              authorizationProvider: TestAuthorizationProvider,
            }),
          ],
          controllers: [
            DefaultEBS,
          ],
          providers: [],
        })
        authenticationProvider = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
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

      it('should inject TestAuthorizationProvider', () => {
        expect(authenticationProvider).toBeInstanceOf(TestAuthenticationProvider)
      })

      it('should set user into clsmanager', () => {
        const user = {
          username: 'username',
        }
        jest.spyOn(authenticationProvider, 'getAuthenticatedUser').mockImplementation(async () => user)

        return request(app.getHttpServer())
          .get('/user')
          .expect(200)
          .expect(user)
      })
    })

  })


})