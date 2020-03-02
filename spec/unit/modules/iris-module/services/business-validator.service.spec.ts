import { Test } from '@nestjs/testing'
import { BusinessException } from '@u-iris/iris-common'
import { TestsUtils } from '@u-iris/iris-common-test-utils'
import { BusinessValidatorService, IrisModule } from '../../../../../src'
import { jf } from '../../../../../src/decorators'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'

class DTO {

  @jf.number().greater(0)
  public count: number

  @jf.string().required()
  public name: string

}

class UserEntity {

  @jf.string().min(5).required()
  public login: string

}

describe('BusinessValidatorService', () => {
  let businessValidatorService: BusinessValidatorService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [IrisModule.forRoot(irisModuleOptionsForTests)],
    }).compile()
    businessValidatorService = module.get<BusinessValidatorService>(BusinessValidatorService)
  })

  it('should export validate joiful decorators', async () => {
    const object = new DTO()
    object.count = -1
    await TestsUtils.expectThrowIrisExceptionLike(() => businessValidatorService.validate(object), BusinessException,
      {
        field: 'count',
        limit: 0,
        value: -1,
        label: 'DTO must have count greater that 0',
      },
      {
        field: 'name',
        label: 'Field name is required',
      },
    )
  })

  it('should construct labels with class name base', async () => {
    const object = new UserEntity()
    await TestsUtils.expectThrowIrisExceptionLike(() => businessValidatorService.validate(object), BusinessException,
      {
        field: 'login',
        code: 'any.required',
        label: 'User must have a login',
      },
    )
  })
})
