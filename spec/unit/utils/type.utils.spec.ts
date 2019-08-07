import { BusinessException, TechnicalException } from '@u-iris/iris-common'
import moment from 'moment'
import { TypeUtils } from '../../../src/utils'

describe('Type converter', () => {
  describe('stringToIntbase10', () => {
    it('should convert string to int', () => {
      expect(TypeUtils.stringToIntBase10('15')).toEqual(15)
      expect(TypeUtils.stringToIntBase10('3')).toEqual(3)
      expect(TypeUtils.stringToIntBase10('-53')).toEqual(-53)
    })
    it('should throw error', () => {
      expect(() => TypeUtils.stringToIntBase10('15.5')).toThrow(BusinessException)
      expect(() => TypeUtils.stringToIntBase10('5 1')).toThrow(BusinessException)
      expect(() => TypeUtils.stringToIntBase10('dezfez')).toThrow(BusinessException)
    })
  })
  describe('stringToDate', () => {
    it('should convert string to date', () => {
      expect(TypeUtils.stringToDate('20171214')).toEqual(moment('20171214').toDate())
      expect(TypeUtils.stringToDate('2017-12-14')).toEqual(moment('2017-12-14').toDate())
      expect(TypeUtils.stringToDate('2017-12-14T00:00:00')).toEqual(moment('2017-12-14T00:00:00').toDate())
      expect(TypeUtils.stringToDate('2017-12-14T16:34:10.234')).toEqual(moment('2017-12-14T16:34:10.234').toDate())
      expect(TypeUtils.stringToDate('2017-12-14T00:00:00.000')).toEqual(moment('2017-12-14').toDate())
    })
    it('should throw error', () => {
      expect(() => TypeUtils.stringToDate('5 1')).toThrow(BusinessException)
      expect(() => TypeUtils.stringToDate('01/01/2020')).toThrow(BusinessException)
    })
  })
  describe('convertToType', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
    it('should return string', () => {
      expect(TypeUtils.convertToType(TypeUtils.TYPE.STRING, 'fez')).toEqual('fez')
    })
    it('should call stringToIntBase10', () => {
      const mock = jest.spyOn(TypeUtils, 'stringToIntBase10')
      try {
        TypeUtils.convertToType(TypeUtils.TYPE.INT, 'fez')
      } catch (e) {
        // none
      }
      expect(mock).toBeCalledTimes(1)
      expect(mock).toBeCalledWith('fez')
    })
    it('should call stringToDate', () => {
      const mock = jest.spyOn(TypeUtils, 'stringToDate')
      try {
        TypeUtils.convertToType(TypeUtils.TYPE.DATE, 'fez')
      } catch (e) {
        // none
      }
      expect(mock).toBeCalledTimes(1)
      expect(mock).toBeCalledWith('fez')
    })
    it('should throw exception', () => {
      // @ts-ignore
      expect(() => TypeUtils.convertToType('object', 'fez')).toThrow(TechnicalException)
    })
  })
})
