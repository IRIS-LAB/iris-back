import { Test } from '@nestjs/testing'
import { IrisModule } from '../../../../../src/modules/iris-module'
import { MessageProvider } from '../../../../../src/modules/iris-module/providers'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'

describe('Messages module', () => {
  let messageProvider: MessageProvider

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [IrisModule.forRoot(irisModuleOptionsForTests)]
    }).compile()
    messageProvider = module.get<MessageProvider>(MessageProvider)
  })

  it('should export MessageProvider', () => {
    expect(messageProvider).toBeDefined()
    expect(messageProvider.get).toBeDefined()
    expect(messageProvider.get).toBeInstanceOf(Function)
    expect(messageProvider.has).toBeDefined()
    expect(messageProvider.has).toBeInstanceOf(Function)
  })
  it('should get message', () => {
    expect(messageProvider.get('security.authentication')).toEqual('You must be logged in')
    expect(messageProvider.get('test.key')).toEqual('this is a test value')
    expect(messageProvider.get('test.variable.key', {
      var: 'var1',
      value: 'value1'
    })).toEqual('this is a test value for variable var1 = value1')
    expect(messageProvider.get('test.variable2.key', {
      var: 'var1',
      value: 'value1'
    })).toEqual('this is a test value for variable var1 = value1')
  })
  it('should check if message exists', () => {
    expect(messageProvider.has('test.key')).toBe(true)
    expect(messageProvider.has('test.key.unknown')).toBe(false)
  })
})
