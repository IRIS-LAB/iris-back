/**
 * advanced search for postgre
 * @module search/SearchUtilsPostgre
 */

import { Op } from 'sequelize'

const MIN = 'min'
const MAX = 'max'
const BEFORE = 'before'
const AFTER = 'after'

/**
 * Add the search greater than or equal for a property
 * @param {String} prop
 *                  name of property
 * @param {TypeOfProp} param
 *                  parameter for this property
 */
function searchMin(prop, param, objectWhere) {
  checkObjectExist(objectWhere, prop)
  objectWhere[prop][Op.gte] = param
}

/**
 * Add the search less than or equal for a property
 * @param {String} prop
 *                  name of property
 * @param {TypeOfProp} param
 *                  parameter for this property
 * @param {Object} objectWhere
 *              JSON object that will be sent to sequelize
 */
function searchMax(prop, param, objectWhere) {
  checkObjectExist(objectWhere, prop)
  objectWhere[prop][Op.lte] = param
}

/**
 * Permits searching on a string with wildcards(*)
 * @param {String} prop
 * 					name of property
 * @param {String} param
 * 					the string who is searching with wildcards
 */
function searchString(prop, param, objectWhere) {
  if (param.includes('*')) {
    checkObjectExist(objectWhere, prop)
    objectWhere[prop] = addLike(param)
  } else {
    objectWhere[prop] = param
  }
}

/**
 * @private
 *
 * @param {String} param
 * @param {object} objectWhere
 * @returns {object}
 */
function addLike(param, objectWhere = {}) {
  param = param.replace(RegExp(/\*/, 'g'), '%')
  objectWhere[Op.iLike] = param
  return objectWhere
}

/**
 * Add the search for a list for a property
 * @param {String} prop - name of property
 * @param {Array} param - array who will search
 * @param {Object} objectWhere - JSON object that will be sent to sequelize
 */
function searchList(prop, param, objectWhere) {
  param = createListSinceOfString(param)
  checkObjectExist(objectWhere, prop)
  objectWhere[prop][Op.or] = []
  param.forEach(element => {
    objectWhere[prop][Op.or].push(addLike(element))
  })
}

/**
 * Create list if string contains ,
 * @param {Strins | Array} param
 * @returns object in array if string conains , else object is return
 */
function createListSinceOfString(param) {
  if (typeof param === 'string' && param.includes(',')) {
    param = param.split(',')
  }
  return param
}

function checkObjectExist(object, prop) {
  if (!object[prop]) {
    object[prop] = {}
  }
}

/**
 *  clone all query params without size, sort and page
 * @param {Object} query all query params (req.query)
 * @returns {Object} all query params without size , sort and page
 */
function cloneQueryWitoutSizeSortPage(query) {
  const { size, sort, page, ...clone } = query
  return clone
}

function conditionForWhere(where, object, param) {
  if (param.includes(MIN) || param.includes(AFTER)) {
    const prop = param.replace(RegExp(/^(min|after)+/, 'g'), '')
    searchMin(prop, object[param], where)
  } else if (param.includes(MAX) || param.includes(BEFORE)) {
    const prop = param.replace(RegExp(/^(max|before)+/, 'g'), '')
    searchMax(prop, object[param], where)
  } else if (object[param] instanceof Array || object[param].includes(',')) {
    searchList(param, object[param], where)
  } else {
    searchString(param, object[param], where)
  }
}

/**
 *  Generate a where who will send a sequelize
 * @param {Object} query
 *                    all query params (req.query)
 * @returns {Object} object where who will send a sequelize
 *
 */
function generateWhere(query) {
  const clone = cloneQueryWitoutSizeSortPage(query)
  const where = {}
  for (const key in clone) {
    if (clone.hasOwnProperty(key)) {
      conditionForWhere(where, clone, key)
    }
  }
  return where
}

export default {
  searchMin,
  searchMax,
  searchString,
  searchList,
  generateWhere,
}
