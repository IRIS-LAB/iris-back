import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import request from 'supertest'
import { getConnection } from 'typeorm'
import { middlewares } from '../../../src/middlewares'
import { getLogger, IrisModule, LoggingInterceptor, TraceContextInterceptor } from '../../../src/modules/iris-module'
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
        .expect({ status: 'UP' })
    })

    it('should return down', async () => {
      await databaseTestUtils.closeDbConnection()
      return request(app.getHttpServer())
        .get('/actuator/health')
        .expect(200)
        .expect({ status: 'DOWN' })
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
      providers: [OrderLBS, OrderDAO, AmountCalculator,
        {
          provide: APP_INTERCEPTOR,
          useClass: TraceContextInterceptor,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: LoggingInterceptor,
        }],
    })
    class AppModuleConnections implements NestModule {
      public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
        const middlewaresWithLogger = middlewares(getLogger())
        consumer.apply(middlewaresWithLogger.parseJSON).forRoutes('/')
        consumer.apply(middlewaresWithLogger.enableCors).forRoutes('/')
        consumer.apply(middlewaresWithLogger.enableCompression).forRoutes('/')
        consumer.apply(middlewaresWithLogger.enableSecurity).forRoutes('/')
        consumer.apply(middlewaresWithLogger.actuator).forRoutes('/actuator')
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
        .expect({ status: 'UP' })
    })

    it('should return down because all the connections are down', async () => {
      await getConnection('default').close()
      await getConnection('connection2').close()
      return request(app.getHttpServer())
        .get('/actuator/health')
        .expect(200)
        .expect({ status: 'DOWN' })
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
        .expect({ status: 'DOWN' })
        .then(() => getConnection('default').connect())
    })
    it('should return down because connection2 is down', async () => {
      await getConnection('connection2').close()
      return request(app.getHttpServer())
        .get('/actuator/health')
        .expect(200)
        .expect({ status: 'DOWN' })
        .then(() => getConnection('connection2').connect())
    })
  })

})
