import { Controller, Get, INestApplication, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import request from 'supertest'
import { APP_AUTHORIZATION_SERVICE } from '../../../../../src/constants'
import { AuthorizationService, IrisModule } from '../../../../../src/modules/iris-module'
import { RequireRole } from '../../../../../src/modules/iris-module/middlewares/require-role.middleware'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { TestUtils } from '../../../../commons/test.utils'
import anything = jasmine.anything


@Controller('/')
class DefaultEBS {

  @Get('/')
  public async index(): Promise<{ foo: string }> {
    return { foo: 'bar' }
  }
}

@Module({
  imports: [
    IrisModule.forRoot(irisModuleOptionsForTests),
  ],
  controllers: [
    DefaultEBS,
  ],
  providers: [],
})
class DefaultModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): any {
    consumer.apply(RequireRole('ROLE1')).forRoutes('/')
    return consumer
  }

}

describe('RequireRole middleware', () => {
  let app: INestApplication
  let authorizationService: AuthorizationService

  beforeAll(async () => {
    const bootstraped = await TestUtils.bootstrapNestJS({
      imports: [
        DefaultModule,
      ],
    })

    authorizationService = bootstraped.module.get(APP_AUTHORIZATION_SERVICE)

    app = bootstraped.app
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    TestUtils.cleanApplication()
  })
  it('should check role', () => {
    const mock = jest.spyOn(authorizationService, 'validateAuthorization')

    return request(app.getHttpServer())
      .get('/')
      .expect(403)
      .expect((response) => {
        expect(mock).toHaveBeenCalledTimes(1)
        expect(mock).toHaveBeenCalledWith(anything(), 'ROLE1')
      })

  })
})