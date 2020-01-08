import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { APP_AUTHORIZATION_SERVICE } from '../../../src/constants'
import { AuthorizationService, IrisModule } from '../../../src/modules/iris-module'
import { AddressBE } from '../../commons/objects/business/be/AddressBE'
import { OrderBE } from '../../commons/objects/business/be/OrderBE'
import { OrderLineBE } from '../../commons/objects/business/be/OrderLineBE'
import { ProductBE } from '../../commons/objects/business/be/ProductBE'
import { AmountCalculator } from '../../commons/services/business/AmountCalculator'
import { OrderLBS } from '../../commons/services/business/OrderLBS'
import { OrderDAO } from '../../commons/services/data/OrderDAO'
import { OrderEBS } from '../../commons/services/exposition/OrderEBS'
import { TestUtils } from '../../commons/test.utils'
import { DatabaseTestUtils } from '../database-test-utils.service'
import '../e2e-config-loader'
import { getTypeOrmConfiguration } from '../module/connection.db'
import { AppModule } from '../module/testapp.module'
import { testappIrisModuleOptions } from '../module/testapp.module.options'

describe('Actuator (e2e)', () => {
  describe('/health', () => {
    describe('Single connection', () => {
      let app
      let databaseTestUtils: DatabaseTestUtils

      beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
          providers: [DatabaseTestUtils],
        }).compile()
        app = TestUtils.constructApplicationFromModule(moduleFixture)
        databaseTestUtils = moduleFixture.get<DatabaseTestUtils>(DatabaseTestUtils)
        await app.init()
      })

      afterAll(async () => {
        await app.close()
        TestUtils.cleanApplication()
      })

      beforeEach(async () => {
        await databaseTestUtils.cleanDatabase()
      })

      it('should return up', () => {
        return request(app.getHttpServer())
          .get('/actuator/health')
          .expect(200)
          .expect(response => {
            expect(response).toBeDefined()
            expect(response.body).toBeDefined()
            expect(response.body.status).toEqual('UP')
          })
      })

      it('should return down', async () => {
        await databaseTestUtils.closeDbConnection()
        return request(app.getHttpServer())
          .get('/actuator/health')
          .expect(200)
          .expect(response => {
            expect(response).toBeDefined()
            expect(response.body).toBeDefined()
            expect(response.body.status).toEqual('DOWN')
          })
          .then(() => databaseTestUtils.openDbConnection())
      })
    })
    describe('Multiple connection', () => {
      let app

      @Module({
        imports: [
          TypeOrmModule.forRoot({
            ...getTypeOrmConfiguration(),
            entities: [OrderBE, OrderLineBE, AddressBE, ProductBE],
          }),
          TypeOrmModule.forFeature([OrderBE, OrderLineBE, AddressBE, ProductBE]),

          TypeOrmModule.forRoot({ ...getTypeOrmConfiguration(), name: 'connection2', entities: [] }),
          TypeOrmModule.forFeature([], 'connection2'),

          IrisModule.forRoot(testappIrisModuleOptions),
        ],
        controllers: [OrderEBS],
        providers: [OrderLBS, OrderDAO, AmountCalculator],
      })
      class AppModuleConnections implements NestModule {
        public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
          return consumer
        }
      }

      beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModuleConnections],
        }).compile()
        app = TestUtils.constructApplicationFromModule(moduleFixture)
        await app.init()
      })

      afterAll(async () => {
        await app.close()
        TestUtils.cleanApplication()
      })

      it('should return up', () => {
        return request(app.getHttpServer())
          .get('/actuator/health')
          .expect(200)
          .expect(response => {
            expect(response).toBeDefined()
            expect(response.body).toBeDefined()
            expect(response.body.status).toEqual('UP')
          })
      })

      it('should return down because all the connections are down', async () => {
        await getConnection('default').close()
        await getConnection('connection2').close()
        return request(app.getHttpServer())
          .get('/actuator/health')
          .expect(200)
          .expect(response => {
            expect(response).toBeDefined()
            expect(response.body).toBeDefined()
            expect(response.body.status).toEqual('DOWN')
          })
          .then(async () => {
            await getConnection('default').connect()
            await getConnection('connection2').connect()
          })
      })

      it('should return down because connection1 is down', async () => {
        await getConnection('default').close()
        return request(app.getHttpServer())
          .get('/actuator/health')
          .expect(200)
          .expect(response => {
            expect(response).toBeDefined()
            expect(response.body).toBeDefined()
            expect(response.body.status).toEqual('DOWN')
          })
          .then(() => getConnection('default').connect())
      })
      it('should return down because connection2 is down', async () => {
        await getConnection('connection2').close()
        return request(app.getHttpServer())
          .get('/actuator/health')
          .expect(200)
          .expect(response => {
            expect(response).toBeDefined()
            expect(response.body).toBeDefined()
            expect(response.body.status).toEqual('DOWN')
          })
          .then(() => getConnection('connection2').connect())
      })
    })
  })

  describe('/info', () => {
    let app
    // @ts-ignore
    const pkg = require('../../../package.json')
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [DatabaseTestUtils],
      }).compile()
      app = TestUtils.constructApplicationFromModule(moduleFixture)
      await app.init()
    })

    afterAll(async () => {
      await app.close()
      TestUtils.cleanApplication()
    })

    it('should be accessible by unsecured', () => {
      return request(app.getHttpServer())
        .get('/actuator/info')
        .expect(200)
        .expect(response => {
          expect(response).toBeDefined()
          expect(response.body).toBeDefined()
          expect(response.body.build).toBeDefined()
          expect(response.body.build.version).toEqual(pkg.version)
          expect(response.body.build.name).toEqual(pkg.name)
        })
    })
  })

  describe('/metrics', () => {
    let app
    let authorizationProvider: AuthorizationService
    // @ts-ignore
    const pkg = require('../../../package.json')
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [DatabaseTestUtils],
      }).compile()
      app = TestUtils.constructApplicationFromModule(moduleFixture)
      authorizationProvider = moduleFixture.get(APP_AUTHORIZATION_SERVICE)
      await app.init()
    })

    afterAll(async () => {
      await app.close()
      TestUtils.cleanApplication()
    })

    it('should not be accessible by secured', () => {
      return request(app.getHttpServer())
        .get('/actuator/metrics')
        .expect(403)
        .expect(response => {
          expect(response).toBeDefined()
          expect(response.body.errors).toBeDefined()
        })
    })

    it('should be accessible by secured', () => {
      jest.spyOn(authorizationProvider, 'validateAuthorization').mockImplementation(async () => true)

      return request(app.getHttpServer())
        .get('/actuator/metrics')
        .expect(200)
        .expect(response => {
          expect(response).toBeDefined()
          expect(response.body).toBeDefined()
          expect(response.body.mem).toBeDefined()
          expect(response.body.uptime).toBeDefined()
        })
    })
  })

  describe('/env', () => {
    let app
    let authorizationProvider: AuthorizationService
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [DatabaseTestUtils],
      }).compile()
      app = TestUtils.constructApplicationFromModule(moduleFixture)
      authorizationProvider = moduleFixture.get(APP_AUTHORIZATION_SERVICE)
      await app.init()
    })

    afterAll(async () => {
      await app.close()
      TestUtils.cleanApplication()
    })

    it('should not be accessible by secured', () => {
      return request(app.getHttpServer())
        .get('/actuator/env')
        .expect(403)
        .expect(response => {
          expect(response).toBeDefined()
          expect(response.body.errors).toBeDefined()
        })
    })

    it('should be accessible by secured', () => {
      jest.spyOn(authorizationProvider, 'validateAuthorization').mockImplementation(async () => true)

      return request(app.getHttpServer())
        .get('/actuator/env')
        .expect(200)
        .expect(response => {
          expect(response).toBeDefined()
          expect(response.body).toBeDefined()
          expect(response.body.propertySources).toBeDefined()
          expect(response.body.propertySources).toBeInstanceOf(Array)
          const systemProperties = response.body.propertySources.find(p => p.name === 'systemProperties')
          expect(systemProperties).toBeDefined()
          expect(systemProperties.properties).toBeDefined()
          expect(systemProperties.properties).toBeInstanceOf(Array)
          expect(systemProperties.properties).toContainObjectLike({ NODE_ENV: { value: 'test' } })
        })
    })
  })


})
