import { BusinessException, ErreurDO } from '@u-iris/iris-common'
import moment from 'moment'


enum TypeEnum {
  STRING = 'string',
  INT = 'int',
  DATE = 'date'
}

type Type = TypeEnum

export class TypeUtils {

  public static TYPE = TypeEnum

  /**
   * Allows to transform the parameter into the type provided
   * @param {TYPE} type
   * @param {String} param
   * @returns param with a good type
   */
  public static convertToType(type: Type, param: string) {
    switch (type) {
      case TypeUtils.TYPE.STRING:
        return param
      case TypeUtils.TYPE.DATE:
        return TypeUtils.stringToDate(param)
      case TypeUtils.TYPE.INT:
        return TypeUtils.stringToIntBase10(param)
      default:
        throw new BusinessException(new ErreurDO('', 'type.wrong', 'The past type is not recognized'))
    }
  }

  /**
   * Transforms string to int
   * @param {String} param - a number
   * @returns number
   */
  public static stringToIntBase10(param: string): number {
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
  public static stringToDate(param: string): Date {
    let dateMoment
    try {
      dateMoment = moment(param, moment.ISO_8601, true)
    } catch (e) {
      // none
    }
    if (!dateMoment || !dateMoment.isValid()) {
      throw new BusinessException(new ErreurDO('', 'type.date.wrong', 'The past param is not a date'))
    }
    return dateMoment.toDate()
  }
}
