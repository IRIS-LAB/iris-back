import { TypeUtils } from '../type/typeUtils'
import { BusinessException, ErreurDO } from '@ugieiris/iris-common'

/**
 * Permits searching on a string with wildcards(*)
 * @param {Object} object
 * 					JSON object that will be sent to mongo
 * @param {String} prop
 * 					name of property
 * @param {String} param
 * 					the string who is searching with wildcards
 */
async function searchStringObject(object, prop, param) {
  try {
    await checkNoInjection(param)
    const startWith = RegExp(/\*$/)
    const endWith = RegExp(/^\*/)
    //contains
    if (endWith.test(param) && startWith.test(param)) {
      param = param.replace(RegExp(/\*/, 'g'), '')
      object[prop] = {}
      object[prop]['$regex'] = new RegExp(param, 'i')
    }
    //end with
    else if (endWith.test(param)) {
      param = param.replace(RegExp(/\*/, 'g'), '')
      object[prop] = {}
      object[prop]['$regex'] = new RegExp(param + '$', 'i')
    }
    //begin with
    else if (startWith.test(param)) {
      param = param.replace(RegExp(/\*/, 'g'), '')
      object[prop] = {}
      object[prop]['$regex'] = new RegExp('^' + param, 'i')
    } else {
      object[prop] = param
    }
  } catch (error) {
    throw new BusinessException(new ErreurDO(prop, 'search.' + prop + '.string'))
  }
}

/**
 * Add the search less than or equal for a property
 * @param {Object} object
 * 					JSON object that will be sent to mongo
 * @param {String} prop
 * 					name of property
 * @param {String} param
 * 					parameter for this property
 * @param {TYPE} type
 * 					parameter's type
 *
 */
async function searchMax(object, prop, param, type) {
  try {
    await checkNoInjection(param)
    param = await TypeUtils.defineType(type, param)
    if (!object[prop]) {
      object[prop] = {}
    }
    object[prop]['$lte'] = param
  } catch (error) {
    throw new BusinessException(new ErreurDO(prop, 'search.' + prop + '.' + error.message))
  }
}

/**
 * Add the search greater than or equal for a property
 * @param {Object} object
 * 					JSON object that will be sent to mongo
 * @param {String} prop
 * 					name of property
 * @param {String} param
 * 					parameter for this property
 * @param {TYPE} type
 * 					parameter's type
 *
 */
async function searchMin(object, prop, param, type) {
  try {
    await checkNoInjection(param)
    param = await TypeUtils.defineType(type, param)
    if (!object[prop]) {
      object[prop] = {}
    }
    object[prop]['$gte'] = param
  } catch (error) {
    throw new BusinessException(new ErreurDO(prop, 'search.' + prop + '.' + error.message))
  }
}

/**
 * Add the search for a list for a property
 * @param {Object} object
 * 					JSON object that will be sent to mongo
 * @param {String} prop
 * 					name of property
 * @param {String[]} param
 * 					parameter for this property
 * @param {TYPE} type
 * 					parameter's type
 *
 */
async function searchList(object, prop, param, type) {
  try {
    if (!object['$or']) {
      object['$or'] = []
    }
    for (let index = 0; index < param.length; index++) {
      checkNoInjection(param)
      const element = await TypeUtils.defineType(type, param[index])
      object.$or.push({ [prop]: element })
    }
  } catch (error) {
    throw new BusinessException(new ErreurDO(prop, 'search.' + prop + '.' + error.message))
  }
}
/**
 * Make sure there are no brackets.
 * @param {String} param
 * 					paramater check
 */
async function checkNoInjection(param) {
  if (RegExp(/[{}]/).test(param)) {
    throw new Error('injection')
  }
}

export const SearchUtilsMongo = {
  checkNoInjection: checkNoInjection,
  searchList: searchList,
  searchMin: searchMin,
  searchMax: searchMax,
  searchStringObject: searchStringObject
}
