import { Controller, Get, INestApplication, Injectable } from '@nestjs/common'
import * as e from 'express'
import request from 'supertest'
import { APP_AUTHENTICATION_SERVICE, APP_AUTHORIZATION_SERVICE } from '../../../../../src/constants'
import {
  AuthenticatedUser,
  AuthenticationService,
  AuthorizationService,
  IrisModule,
  Secured,
} from '../../../../../src/modules/iris-module'
import { Unsecured } from '../../../../../src/modules/iris-module/decorators/unsecured.decorator'
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

  @Get('/')
  public async index(): Promise<string> {
    return 'OK'
  }

  @Get('/secured')
  @Secured('ROLE1', 'ROLE2')
  public async secured(): Promise<string> {
    return 'OK'
  }

  @Get('/unsecured')
  @Unsecured()
  public async unsecured(): Promise<string> {
    return 'OK'
  }
}

@Controller('/other')
@Secured('ROLE3')
class DefaultEBS2 {

  @Get('/')
  public async index(): Promise<string> {
    return 'OK'
  }

  @Get('/secured')
  @Secured('ROLE1', 'ROLE2')
  public async secured(): Promise<string> {
    return 'OK'
  }

  @Get('/unsecured')
  @Unsecured()
  public async unsecured(): Promise<string> {
    return 'OK'
  }

}

describe('SecuredGuard', () => {
  let app: INestApplication

  describe('canActivate', () => {
    let authorizationProvider: AuthorizationService
    let authenticationProvider: AuthenticationService


    beforeEach(() => {
      jest.clearAllMocks()
    })

    describe('without global secured configuration', () => {

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
            DefaultEBS2,
          ],
          providers: [],
        })
        authorizationProvider = bootstraped.module.get(APP_AUTHORIZATION_SERVICE)
        authenticationProvider = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
        app = bootstraped.app
        await app.init()
      })
      afterAll(async () => {
        await app.close()
        TestUtils.cleanApplication()
      })

      describe('without class secured configuration', () => {
        describe('without method secured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(0)
              })
          })
        })
        describe('with method unsecured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/unsecured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(0)
              })
          })
        })
        describe('with method secured configuration', () => {
          it('should call authorizationProvider.validateAuthorization', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/secured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE1', 'ROLE2')
              })
          })
        })
      })

      describe('with class secured configuration', () => {
        describe('without method secured configuration', () => {
          it('should call authorizationProvider with roles from class decorator', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE3')

              })
          })
        })
        describe('with method unsecured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other/unsecured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(0)
              })
          })
        })
        describe('with method secured configuration', () => {
          it('should call authorizationProvider.validateAuthorization with roles from method decorator', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other/secured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE1', 'ROLE2')
              })
          })
        })
      })
    })

    describe('with global secured configuration = true', () => {

      beforeAll(async () => {
        const bootstraped = await TestUtils.bootstrapNestJS({
          imports: [
            IrisModule.forRoot({
              ...irisModuleOptionsForTests,
              authenticationProvider: TestAuthenticationProvider,
              authorizationProvider: TestAuthorizationProvider,
              secured: true,
            }),
          ],
          controllers: [
            DefaultEBS,
            DefaultEBS2,
          ],
          providers: [],
        })
        authorizationProvider = bootstraped.module.get(APP_AUTHORIZATION_SERVICE)
        authenticationProvider = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
        app = bootstraped.app
        await app.init()
      })

      afterAll(async () => {
        await app.close()
        TestUtils.cleanApplication()
      })

      describe('without class secured configuration', () => {
        describe('without method secured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'USER')
              })
          })
        })
        describe('with method unsecured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/unsecured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(0)
              })
          })
        })
        describe('with method secured configuration', () => {
          it('should call authorizationProvider.validateAuthorization', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/secured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE1', 'ROLE2')
              })
          })
        })
      })

      describe('with class secured configuration', () => {
        describe('without method secured configuration', () => {
          it('should call authorizationProvider with roles from class decorator', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE3')

              })
          })
        })
        describe('with method unsecured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other/unsecured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(0)
              })
          })
        })
        describe('with method secured configuration', () => {
          it('should call authorizationProvider.validateAuthorization with roles from method decorator', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other/secured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE1', 'ROLE2')
              })
          })
        })
      })
    })

    describe('with global secured configuration = \'MY_ROLE\'', () => {

      beforeAll(async () => {
        const bootstraped = await TestUtils.bootstrapNestJS({
          imports: [
            IrisModule.forRoot({
              ...irisModuleOptionsForTests,
              authenticationProvider: TestAuthenticationProvider,
              authorizationProvider: TestAuthorizationProvider,
              secured: 'MY_ROLE',
            }),
          ],
          controllers: [
            DefaultEBS,
            DefaultEBS2,
          ],
          providers: [],
        })
        authorizationProvider = bootstraped.module.get(APP_AUTHORIZATION_SERVICE)
        authenticationProvider = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
        app = bootstraped.app
        await app.init()
      })

      afterAll(async () => {
        await app.close()
        TestUtils.cleanApplication()
      })

      describe('without class secured configuration', () => {
        describe('without method secured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'MY_ROLE')
              })
          })
        })
        describe('with method unsecured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/unsecured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(0)
              })
          })
        })
        describe('with method secured configuration', () => {
          it('should call authorizationProvider.validateAuthorization', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/secured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE1', 'ROLE2')
              })
          })
        })
      })

      describe('with class secured configuration', () => {
        describe('without method secured configuration', () => {
          it('should call authorizationProvider with roles from class decorator', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE3')

              })
          })
        })
        describe('with method unsecured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other/unsecured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(0)
              })
          })
        })
        describe('with method secured configuration', () => {
          it('should call authorizationProvider.validateAuthorization with roles from method decorator', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other/secured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE1', 'ROLE2')
              })
          })
        })
      })
    })

    describe('with global secured configuration = [\'MY_ROLE1\', \'MY_ROLE2\']', () => {

      beforeAll(async () => {
        const bootstraped = await TestUtils.bootstrapNestJS({
          imports: [
            IrisModule.forRoot({
              ...irisModuleOptionsForTests,
              authenticationProvider: TestAuthenticationProvider,
              authorizationProvider: TestAuthorizationProvider,
              secured: ['MY_ROLE1', 'MY_ROLE2'],
            }),
          ],
          controllers: [
            DefaultEBS,
            DefaultEBS2,
          ],
          providers: [],
        })
        authorizationProvider = bootstraped.module.get(APP_AUTHORIZATION_SERVICE)
        authenticationProvider = bootstraped.module.get(APP_AUTHENTICATION_SERVICE)
        app = bootstraped.app
        await app.init()
      })

      describe('without class secured configuration', () => {
        describe('without method secured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'MY_ROLE1', 'MY_ROLE2')
              })
          })
        })
        describe('with method unsecured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/unsecured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(0)
              })
          })
        })
        describe('with method secured configuration', () => {
          it('should call authorizationProvider.validateAuthorization', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/secured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE1', 'ROLE2')
              })
          })
        })
      })

      describe('with class secured configuration', () => {
        describe('without method secured configuration', () => {
          it('should call authorizationProvider with roles from class decorator', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE3')

              })
          })
        })
        describe('with method unsecured configuration', () => {
          it('should not call authorizationProvider', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other/unsecured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(0)
              })
          })
        })
        describe('with method secured configuration', () => {
          it('should call authorizationProvider.validateAuthorization with roles from method decorator', async () => {
            const mockGetAuthenticatedUser = jest.spyOn(authenticationProvider, 'getAuthenticatedUser')
            const mockCanActivate = jest.spyOn(authorizationProvider, 'validateAuthorization')
            return request(app.getHttpServer())
              .get('/other/secured')
              .expect(() => {
                expect(mockGetAuthenticatedUser).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledTimes(1)
                expect(mockCanActivate).toHaveBeenCalledWith(expect.anything(), 'ROLE1', 'ROLE2')
              })
          })
        })
      })
    })
  })

})