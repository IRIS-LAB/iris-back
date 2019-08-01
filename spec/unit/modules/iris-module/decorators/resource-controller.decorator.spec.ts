import { Get, INestApplication } from '@nestjs/common'
import '@u-iris/iris-common-test-utils'
import request from 'supertest'
import {
  IrisModule,
  PaginatedListResult,
  PaginatedResources,
  ResourceController,
} from '../../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { TestUtils } from '../../../../commons/test.utils'

class CommandeBE {
  public id: number
  public name: string
}

@ResourceController(CommandeBE, '/cmdes', 'commandes_resource')
class CommandesResourceEBS {

  @Get('/')
  @PaginatedResources(10, 100)
  public async search(): Promise<PaginatedListResult<CommandeBE>> {
    return {
      list: [{ id: 1, name: 'name1' }, { id: 2, name: 'name2' }],
      count: 2,
    }
  }
}

@ResourceController(CommandeBE, '/commandes')
class CommandesEBS {

  @Get('/')
  @PaginatedResources(10, 100)
  public async search(): Promise<PaginatedListResult<CommandeBE>> {
    return {
      list: [{ id: 1, name: 'name1' }, { id: 2, name: 'name2' }],
      count: 2,
    }
  }
}

describe('@ResourceController', () => {
  let app: INestApplication

  beforeAll(async () => {
    const bootstraped = await TestUtils.bootstrapNestJS({
      imports: [
        IrisModule.forRoot(irisModuleOptionsForTests),
      ],
      controllers: [
        CommandesResourceEBS, CommandesEBS,
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

  it('should return results with resource extracted from path', () => {
    return request(app.getHttpServer())
      .get('/commandes')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.header['accept-range']).toEqual('commandes 100')
      })
  })
  it('should return results with resource set in annotation', () => {
    return request(app.getHttpServer())
      .get('/cmdes')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.header['accept-range']).toEqual('commandes_resource 100')
      })
  })
})
