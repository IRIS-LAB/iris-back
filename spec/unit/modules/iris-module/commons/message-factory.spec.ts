import path from 'path'
import { MessageFactory } from '../../../../../src/modules/iris-module/commons'

describe('Message Factory', () => {
  const i18nTestInput = path.resolve(__dirname, '../../../../resources', 'i18n-test.properties')
  describe('get', () => {
    it('should get message', () => {
      const messageFactory = new MessageFactory({
        resources: i18nTestInput,
      })
      expect(messageFactory.get('security.authentication')).toEqual('You must be logged in')
      expect(messageFactory.get('test.key')).toEqual('this is a test value')
    })

    it('should get message with replaced dataas', () => {
      const messageFactory = new MessageFactory({
        resources: i18nTestInput,
      })
      expect(messageFactory.get('test.variable.key', {
        var: 'var1',
        value: 'value1',
      })).toEqual('this is a test value for variable var1 = value1')
      expect(messageFactory.get('test.variable2.key', {
        var: 'var1',
        value: 'value1',
      })).toEqual('this is a test value for variable var1 = value1')
      expect(messageFactory.get('test.variables.key', {
        val: 'my first value',
        value: 'my second value',
      })).toEqual('this is a test for my second value')
    })
  })
})
