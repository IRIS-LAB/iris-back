import { BusinessException, ErreurDO } from '@u-iris/iris-common'
import moment from 'moment'
import { typeUtilsError } from '../../error'

/**
 * Enum type
 */
const TYPE = {
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
function defineType(type, param) {
  switch (type) {
    case TYPE.STRING:
      break
    case TYPE.DATE:
      param = stringToDate(param)
      break
    case TYPE.INT:
      param = stringToIntBase10(param)
      break
    default:
      throw new BusinessException(
        new ErreurDO('', typeUtilsError.defineType.code, typeUtilsError.defineType.label),
      )
  }
  return param
}

/**
 * Transforms string to int
 * @param {String} param - a number
 * @returns number
 */
function stringToIntBase10(param) {
  const regInt = RegExp(/^\d+$/, 'g')
  if (!regInt.test(param)) {
    throw new BusinessException(
      new ErreurDO(
        '',
        typeUtilsError.stringToIntBase10.code,
        typeUtilsError.stringToIntBase10.label,
      ),
    )
  }
  return parseInt(param)
}

/**
 * Transforms string to date
 * @param {String} param - a date
 * @returns date
 */
function stringToDate(param) {
  try {
    if (!moment(param, moment.HTML5_FMT.DATETIME_LOCAL_MS, true).isValid()) {
      throw new BusinessException(
        new ErreurDO('', typeUtilsError.stringToDate.code, typeUtilsError.stringToDate.label),
      )
    }
    return new Date(param)
  } catch (error) {
    throw error
  }
}

export default {
  TYPE,
  defineType,
  stringToIntBase10,
  stringToDate,
}
