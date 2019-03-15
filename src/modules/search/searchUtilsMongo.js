/**
 * advanced search for mongoDb
 * @module SearchUtilsmongodb
 */

import { BusinessException, ErreurDO } from '@ugieiris/iris-common'
import TypeUtils from '../type/typeUtils'
import { searchUtilsMongodbError } from '../../error'

/**
 * Permits searching on a string with wildcards(*)
 * @param {String} prop - name of property
 * @param {String} param - the string who is searching with wildcards
 * @param {Object} object - JSON object that will be sent to mongo
 */
async function searchString(prop, param, object) {
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
    throw new BusinessException(new ErreurDO(prop))
  }
}

/**
 * Add the search less than or equal for a property
 * @param {Object} object - JSON object that will be sent to mongo
 * @param {String} prop - name of property
 * @param {String} param - parameter for this property
 * @param {TYPE} type - parameter's type
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
    throw new BusinessException(new ErreurDO(prop, error.codeErreur, error.libelleErreur))
  }
}

/**
 * Add the search greater than or equal for a property
 * @param {Object} object - JSON object that will be sent to mongo
 * @param {String} prop - name of property
 * @param {String} param - parameter for this property
 * @param {TYPE} type - parameter's type
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
    throw new BusinessException(new ErreurDO(prop, error.codeErreur, error.libelleErreur))
  }
}

/**
 * Add the search for a list for a property
 * @param {Object} object - JSON object that will be sent to mongo
 * @param {String} prop - name of property
 * @param {String[]} param - parameter for this property
 * @param {TYPE} type - parameter's type
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
    throw new BusinessException(new ErreurDO(prop, error.codeErreur, error.libelleErreur))
  }
}
/**
 * Make sure there are no brackets.
 * @param {String} param - paramater check
 */
async function checkNoInjection(param) {
  if (RegExp(/[{}]/).test(param)) {
    throw new BusinessException(
      new ErreurDO(
        '',
        searchUtilsMongodbError.checkNoInjection.code,
        searchUtilsMongodbError.checkNoInjection.label,
      ),
    )
  }
}

export default {
  checkNoInjection,
  searchList,
  searchMin,
  searchMax,
  searchString,
}
