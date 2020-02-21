import { Controller, Get, INestApplication, Injectable } from '@nestjs/common'
import * as e from 'express'
import request from 'supertest'
import { APP_AUTHENTICATION_SERVICE } from '../../../../../src/constants'
import {
  AuthenticatedUser,
  AuthenticationService,
  AuthorizationService,
  IrisModule,
  Secured,
  ClsService,
} from '../../../../../src/modules/iris-module'
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


describe('AuthenticationService', () => {
  let app: INestApplication

  let authenticationService: AuthenticationService


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
        ],
        providers: [],
      })
      authenticationService = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
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
      expect(authenticationService).toBeInstanceOf(TestAuthenticationService)
    })

    it('should set user into clsService', () => {
      const user = {
        username: 'username',
      }
      jest.spyOn(authenticationService, 'getAuthenticatedUser').mockImplementation(async () => user)

      return request(app.getHttpServer())
        .get('/user')
        .expect(200)
        .expect(user)
    })
  })

})