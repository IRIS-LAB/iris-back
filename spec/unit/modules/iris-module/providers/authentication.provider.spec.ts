import { Controller, Get, INestApplication, Injectable } from '@nestjs/common'
import * as e from 'express'
import request from 'supertest'
import { APP_AUTHENTICATION_SERVICE } from '../../../../../src/constants'
import {
  AuthenticatedUser,
  AuthenticationService,
  AuthorizationService,
  ClsProvider,
  IrisModule,
  Secured,
} from '../../../../../src/modules/iris-module'
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


describe('AuthenticationProvider', () => {
  let app: INestApplication

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