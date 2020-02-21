import { Test } from '@nestjs/testing'
import { IrisModule, MessageService } from '../../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'

describe('MessageService', () => {
  let messageService: MessageService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [IrisModule.forRoot(irisModuleOptionsForTests)]
    }).compile()
    messageService = module.get<MessageService>(MessageService)
  })

  it('should export MessageProvider', () => {
    expect(messageService).toBeDefined()
    expect(messageService.get).toBeDefined()
    expect(messageService.get).toBeInstanceOf(Function)
    expect(messageService.has).toBeDefined()
    expect(messageService.has).toBeInstanceOf(Function)
  })
  it('should get message', () => {
    expect(messageService.get('security.authentication')).toEqual('You must be logged in')
    expect(messageService.get('test.key')).toEqual('this is a test value')
    expect(messageService.get('test.variable.key', {
      var: 'var1',
      value: 'value1'
    })).toEqual('this is a test value for variable var1 = value1')
    expect(messageService.get('test.variable2.key', {
      var: 'var1',
      value: 'value1'
    })).toEqual('this is a test value for variable var1 = value1')
  })
  it('should check if message exists', () => {
    expect(messageService.has('test.key')).toBe(true)
    expect(messageService.has('test.key.unknown')).toBe(false)
  })
})
