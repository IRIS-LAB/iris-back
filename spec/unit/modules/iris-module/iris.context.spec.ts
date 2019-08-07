import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ErrorDO, TechnicalException } from '@u-iris/iris-common'
import '@u-iris/iris-common-test-utils'
import { ExceptionFilter } from '../../../../src/filters'
import { getLoggerProvider, IrisModule, setApplicationContext } from '../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../commons/message-factory-for-tests'
import { TestUtils } from '../../../commons/test.utils'

describe('Iris module context', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        IrisModule.forRoot(irisModuleOptionsForTests),
      ],
      controllers: [],
      providers: [],
    }).compile()
    app = module.createNestApplication()
    app.useGlobalFilters(new ExceptionFilter()) // error handler
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    TestUtils.cleanApplication()
  })

  it('should throw error because application context is not set', () => {
    expect(getLoggerProvider).toThrow(new TechnicalException(new ErrorDO('applicationContext', 'null', 'setApplicationContext() has not been called'), new Error()))
  })
  it('should throw error because application context is already set', () => {
    setApplicationContext(app)
    expect(() => setApplicationContext(app)).toThrow(new Error('nestjs application context already exists ! Please use this method only one time'))
  })
})
