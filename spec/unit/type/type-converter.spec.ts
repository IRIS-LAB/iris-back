import { BusinessException } from '@u-iris/iris-common'
import moment from 'moment'
import { typeConverter } from '../../../src/type'

describe('Type converter', () => {
  describe('stringToIntbase10', () => {
    it('should convert string to int', () => {
      expect(typeConverter.stringToIntBase10('15')).toEqual(15)
      expect(typeConverter.stringToIntBase10('3')).toEqual(3)
      expect(typeConverter.stringToIntBase10('-53')).toEqual(-53)
    })
    it('should throw error', () => {
      expect(() => typeConverter.stringToIntBase10('15.5')).toThrow(BusinessException)
      expect(() => typeConverter.stringToIntBase10('5 1')).toThrow(BusinessException)
      expect(() => typeConverter.stringToIntBase10('dezfez')).toThrow(BusinessException)
    })
  })
  describe('stringToDate', () => {
    it('should convert string to date', () => {
      expect(typeConverter.stringToDate('20171214')).toEqual(moment('20171214').toDate())
      expect(typeConverter.stringToDate('2017-12-14')).toEqual(moment('2017-12-14').toDate())
      expect(typeConverter.stringToDate('2017-12-14T00:00:00')).toEqual(moment('2017-12-14T00:00:00').toDate())
      expect(typeConverter.stringToDate('2017-12-14T16:34:10.234')).toEqual(moment('2017-12-14T16:34:10.234').toDate())
      expect(typeConverter.stringToDate('2017-12-14T00:00:00.000')).toEqual(moment('2017-12-14').toDate())
    })
    it('should throw error', () => {
      expect(() => typeConverter.stringToDate('5 1')).toThrow(BusinessException)
      expect(() => typeConverter.stringToDate('01/01/2020')).toThrow(BusinessException)
    })
  })
  describe('convertToType', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('should return string', () => {
      expect(typeConverter.convertToType('string', 'fez')).toEqual('fez')
    })
    it('should call stringToIntBase10', () => {
      const mock = jest.spyOn(typeConverter, 'stringToIntBase10')
      try {
        typeConverter.convertToType('int', 'fez')
      } catch (e) {
        // none
      }
      expect(mock).toBeCalledTimes(1)
      expect(mock).toBeCalledWith('fez')
    })
    it('should call stringToDate', () => {
      const mock = jest.spyOn(typeConverter, 'stringToDate')
      try {
        typeConverter.convertToType('date', 'fez')
      } catch (e) {
        // none
      }
      expect(mock).toBeCalledTimes(1)
      expect(mock).toBeCalledWith('fez')
    })
    it('should throw exception', () => {
      // @ts-ignore
      expect(() => typeConverter.convertToType('object', 'fez')).toThrow(BusinessException)
    })
  })
})
