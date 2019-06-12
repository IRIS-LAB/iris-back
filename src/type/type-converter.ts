import { BusinessException, ErreurDO } from '@u-iris/iris-common'
import moment from 'moment'

type Type = 'string' | 'int' | 'date'

class TypeConverter {

  public TYPE: { [key: string]: Type } = {
    STRING: 'string',
    INT: 'int',
    DATE: 'date',
  }

  /**
   * Allows to transform the parameter into the type provided
   * @param {TYPE} type
   * @param {String} param
   * @returns param with a good type
   */
  public convertToType(type: Type, param: string) {
    switch (type) {
      case this.TYPE.STRING:
        return param
      case this.TYPE.DATE:
        return this.stringToDate(param)
      case this.TYPE.INT:
        return this.stringToIntBase10(param)
      default:
        throw new BusinessException(new ErreurDO('', 'type.wrong', 'The past type is not recognized'))
    }
  }

  /**
   * Transforms string to int
   * @param {String} param - a number
   * @returns number
   */
  public stringToIntBase10(param: string): number {
    const regInt = RegExp(/^-?\d+$/, 'g')
    if (!regInt.test(param)) {
      throw new BusinessException(new ErreurDO('', 'type.number.wrong', 'The past param is not a number'))
    }
    return parseInt(param)
  }

  /**
   * Transforms string to date
   * @param {String} param - a date
   * @returns date
   */
  public stringToDate(param: string): Date {
    if (!moment(param, moment.HTML5_FMT.DATETIME_LOCAL_MS, true).isValid()) {
      throw new BusinessException(new ErreurDO('', 'type.date.wrong', 'The past param is not a date'))
    }
    return new Date(param)
  }
}

export const typeConverter = new TypeConverter()
