import { Controller, Get, INestApplication } from '@nestjs/common'
import '@u-iris/iris-common-test-utils'
import 'reflect-metadata'
import request from 'supertest'
import { AllowedOptions, NotExposed, Relation } from '../../../src/decorators'
import { RelationEntity } from '../../../src/enums'
import { IrisModule } from '../../../src/modules/iris-module'
import { Resource } from '../../../src/modules/iris-module/decorators'
import { irisModuleOptionsForTests } from '../../commons/message-factory-for-tests'
import { TestUtils } from '../../commons/test.utils'

class DTOExposed {
  public id: number
  public exposed: string
}

class DTONotExposed {
  public id: number

  @NotExposed()
  public notExposed: string
}

@AllowedOptions('child')
class DTOContainerExposed {
  @Relation(RelationEntity.ASSOCIATION)
  public child: DTOExposed
}

@AllowedOptions('child')
class DTOContainerNotExposed {
  @Relation(RelationEntity.ASSOCIATION)
  public child: DTONotExposed
}

@Controller('/exposed')
class ExposedEBS {
  @Get('/')
  @Resource(DTOExposed)
  public async index(): Promise<DTOExposed> {
    return { id: 1, exposed: 'value' }
  }
}

@Controller('/notExposed')
class NotExposedEBS {

  @Get('/')
  @Resource(DTONotExposed)
  public async index(): Promise<DTONotExposed> {
    return { id: 1, notExposed: 'value' }
  }
}

@Controller('/containerExposed')
class ContainerExposedEBS {
  @Get('/')
  @Resource(DTOContainerExposed)
  public async index(): Promise<DTOContainerExposed> {
    return { child: { id: 1, exposed: 'value' } }
  }
}

@Controller('/containerNotExposed')
class ContainerNotExposedEBS {
  @Get('/')
  @Resource(DTOContainerNotExposed)
  public async index(): Promise<DTOContainerNotExposed> {
    return { child: { id: 1, notExposed: 'value' } }
  }
}

describe('Decorator @NotExposed', () => {
  let app: INestApplication

  beforeAll(async () => {
    const bootstraped = await TestUtils.bootstrapNestJS({
      imports: [
        IrisModule.forRoot(irisModuleOptionsForTests),
      ],
      controllers: [
        ExposedEBS, NotExposedEBS, ContainerExposedEBS, ContainerNotExposedEBS,
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

  describe('Without @NotExposed()', () => {
    it('should return datas', () => {
      return request(app.getHttpServer())
        .get('/exposed')
        .expect(200)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toEqual({ id: 1, exposed: 'value' },
          )
        })

    })
    it('should return container with association', () => {
      return request(app.getHttpServer())
        .get('/containerExposed')
        .expect(200)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toEqual({ child: { id: 1 } },
          )
        })

    })
    it('should return container with options', () => {
      return request(app.getHttpServer())
        .get('/containerExposed?options=child')
        .expect(200)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toEqual({ child: { id: 1, exposed: 'value' } },
          )
        })

    })
  })

  describe('With @NotExposed()', () => {
    it('should return datas', () => {
      return request(app.getHttpServer())
        .get('/notExposed')
        .expect(200)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toEqual({ id: 1 },
          )
        })

    })
    it('should return container with association', () => {
      return request(app.getHttpServer())
        .get('/containerNotExposed')
        .expect(200)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toEqual({ child: { id: 1 } },
          )
        })

    })
    it('should return container with options', () => {
      return request(app.getHttpServer())
        .get('/containerNotExposed?options=child')
        .expect(200)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toEqual({ child: { id: 1 } },
          )
        })

    })
  })

  it('should return datas without not exposed fields', () => {
    return request(app.getHttpServer())
      .get('/notExposed')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual({ id: 1 },
        )
      })

  })
})
