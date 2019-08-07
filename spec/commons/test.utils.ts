import { INestApplication } from '@nestjs/common'
import { ModuleMetadata } from '@nestjs/common/interfaces'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { ErrorDO } from '@u-iris/iris-common'
import '@u-iris/iris-common-test-utils'
import * as request from 'superagent'
import { ExceptionFilter } from '../../src/filters'
import { cleanApplicationContext, setApplicationContext } from '../../src/modules/iris-module'
import { LoggingInterceptor, TraceContextInterceptor } from '../../src/modules/iris-module/interceptors'
// tslint:disable-next-line:no-var-requires
// require('@u-iris/iris-common-test-utils')

interface ErrorInResponse {
  field?: ErrorDO['field']
  code?: ErrorDO['code']
  label?: ErrorDO['label']
  path?: ErrorDO['path']
  value?: ErrorDO['value']
  limit?: ErrorDO['limit']
}

export class TestUtils {

  public static expectErreurReturned(response: request.Response, ...erreurs: ErrorInResponse[]) {
    expect(response.body).toBeDefined()
    expect(response.body.errors).toBeDefined()
    expect(response.body.errors).toBeInstanceOf(Array)
    expect(response.body.errors).toHaveLength(erreurs.length)
    for (const err of erreurs) {
      expect(response.body.errors).toContainObjectLike(err)
    }
  }

  public static async bootstrapNestJS(metadata: ModuleMetadata): Promise<{ app: INestApplication, module: TestingModule }> {
    if (!metadata.providers) {
      metadata.providers = []
    }
    metadata.providers.unshift({
      provide: APP_INTERCEPTOR,
      useClass: TraceContextInterceptor,
    }, {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    })
    const module: TestingModule = await Test.createTestingModule(metadata).compile()
    const app = TestUtils.constructApplicationFromModule(module)
    return { app, module }
  }

  public static constructApplicationFromModule(module: TestingModule) {
    const app = module.createNestApplication()
    setApplicationContext(app)
    app.useGlobalFilters(new ExceptionFilter()) // error handler
    return app
  }

  public static cleanApplication() {
    cleanApplicationContext()
  }
}
