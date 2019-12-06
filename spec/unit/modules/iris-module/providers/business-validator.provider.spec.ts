import { Test } from '@nestjs/testing'
import { BusinessException } from '@u-iris/iris-common'
import { TestsUtils } from '@u-iris/iris-common-test-utils'
import { Joi } from 'tsdv-joi/core'
import { BusinessValidator } from '../../../../../src/decorators'
import { BusinessValidatorProvider, IrisModule } from '../../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'

class DTO {

  @BusinessValidator(Joi.number().greater(0))
  public count: number

  @BusinessValidator(Joi.string().required())
  public name: string

}

describe('BusinessValidator', () => {
  let businessValidatorProvider: BusinessValidatorProvider

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [IrisModule.forRoot(irisModuleOptionsForTests)],
    }).compile()
    businessValidatorProvider = module.get<BusinessValidatorProvider>(BusinessValidatorProvider)
  })

  it('should export MessageProvider', async () => {
    const object = new DTO()
    object.count = -1
    await TestsUtils.expectThrowIrisExceptionLike(() => businessValidatorProvider.validate(object), BusinessException,
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
})
