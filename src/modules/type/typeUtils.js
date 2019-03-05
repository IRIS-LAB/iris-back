import { BusinessException } from '@u-iris/iris-common'
var moment = require('moment')

/**
 * Enum type
 */
const TYPE = {
  STRING: 'string',
  INT: 'int',
  DATE: 'date'
}

/**
 * Allows to transform the parameter into the type provided
 * @param {TYPE} type
 * @param {String} param
 *
 * @returns param with a good type
 */
async function defineType(type, param) {
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
      throw new BusinessException('bad type')
  }
  return param
}

/**
 * Transforms string to int
 * @param {String} param
 * 					a number
 * @returns number
 */
async function stringToIntBase10(param) {
  const regInt = RegExp(/^\d+$/, 'g')
  if (!regInt.test(param)) {
    throw new Error('number')
  }
  return parseInt(param)
}

/**
 * Transforms string to date
 * @param {String} param
 * 					a date
 * @returns date
 */
async function stringToDate(param) {
  try {
    if (!moment(param, moment.HTML5_FMT.DATETIME_LOCAL_MS, true).isValid()) {
      throw new Error('date')
    }
    return new Date(param)
  } catch (error) {
    throw error
  }
}

export const TypeUtils = {
  TYPE: TYPE,
  defineType: defineType,
  stringToIntBase10: stringToIntBase10,
  stringToDate: stringToDate
}
