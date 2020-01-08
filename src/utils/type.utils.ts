import { BusinessException, ErrorDO, TechnicalException } from '@u-iris/iris-common'
import moment from 'moment'
import { ErrorProvider, getErrorProvider } from '../modules/iris-module'


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
        let errorProvider: ErrorProvider
        try {
          errorProvider = getErrorProvider()
        } catch {
          // not in nestjs context
        }

        // @ts-ignore
        if (errorProvider) {
          throw errorProvider.createTechnicalException('', 'typeUtils.type.invalid', new Error(), {
            type,
            value: param,
          })
        } else {
          throw new TechnicalException(new ErrorDO('', 'typeUtils.type.invalid', 'Cannot convert type ' + type, {value: param}), new Error())
        }
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
      TypeUtils.throwBusinessException('type.number.invalid', { value: param }, TypeUtils.TYPE.INT)
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
      TypeUtils.throwBusinessException('type.date.invalid', { value: param }, TypeUtils.TYPE.DATE)
    }
    return dateMoment.toDate()
  }

  private static throwBusinessException(code: string, datas: any, type: string) {
    let errorProvider: ErrorProvider
    try {
      errorProvider = getErrorProvider()
    } catch {
      // not in nestjs context
    }

    // @ts-ignore
    if (errorProvider) {
      throw errorProvider.createBusinessException('', code, datas)
    } else {
      throw new BusinessException(new ErrorDO('', code, 'Cannot convert in type ' + type, datas))
    }
  }
}
