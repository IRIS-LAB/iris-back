/**
 * advanced search for postgre
 * @module SearchUtilsPostgre
 */

import { Op } from 'sequelize';

function checkObjectExist(object, prop) {
  if (!object[prop]) {
    object[prop] = {};
  }
}

/**
 * Add the search greater than or equal for a property
 * @param {String} prop - name of property
 * @param {TypeOfProp} param - parameter for this property
 * @param {Object} objectWhere - JSON object that will be sent to sequelize
 */
function searchMin(prop, param, objectWhere) {
  checkObjectExist(objectWhere, prop);
  objectWhere[prop][Op.gte] = param;
}

/**
 * Add the search less than or equal for a property
 * @param {String} prop - name of property
 * @param {TypeOfProp} param - parameter for this property
 * @param {Object} objectWhere - JSON object that will be sent to sequelize
 */
function searchMax(prop, param, objectWhere) {
  checkObjectExist(objectWhere, prop);
  objectWhere[prop][Op.lte] = param;
}

/**
 * Permits searching on a string with wildcards(*)
 * @param {String} prop - name of property
 * @param {String} param - the string who is searching with wildcards
 * @param {Object} objectWhere - JSON object that will be sent to sequelize
 */
function searchString(prop, param, objectWhere) {
  if (param.includes('*')) {
    param = param.replace(RegExp(/\*/, 'g'), '%');
    checkObjectExist(objectWhere, prop);
    objectWhere[prop][Op.iLike] = param;
  } else {
    objectWhere[prop] = param;
  }
}

/**
 * Add the search for a list for a property
 * @param {String} prop - name of property
 * @param {String} param - the string who is searching with wildcards
 * @param {Object} objectWhere - JSON object that will be sent to sequelize
 */
function searchList(prop, param, objectWhere) {
  if (typeof param === 'string') {
    searchString(prop, param, objectWhere);
  } else if (typeof param === 'object') {
    checkObjectExist(objectWhere, prop);
    objectWhere[prop][Op.or] = param;
  }
}

/**
 * @private
 *  clone all query params without size, sort and page
 * @param {Object} query - all query params (req.query)
 * @returns {Object} all query params without size , sort and page
 */
function cloneQueryWitoutSizeSortPage(query) {
  const {
 size, sort, page, ...clone 
} = query;
  return clone;
}

function conditionForWhere(where, object, param) {
  if (param.includes('min') || param.includes('after')) {
    const prop = param.replace(RegExp(/^(min|after)+/, 'g'), '');
    searchMin(prop, object[param], where);
  } else if (param.includes('max') || param.includes('before')) {
    const prop = param.replace(RegExp(/^(max|before)+/, 'g'), '');
    searchMax(prop, object[param], where);
  } else {
    searchList(param, object[param], where);
  }
}

/**
 * @description Generate a where who will send a sequelize
 * @param {Object} query - all query params (req.query)
 * @returns {Object} object where who will send a sequelize
 *
 */
function generateWhere(query) {
  const clone = cloneQueryWitoutSizeSortPage(query);
  const where = {};
  for (const key in clone) {
    if (clone.hasOwnProperty(key)) {
      conditionForWhere(where, clone, key);
    }
  }
  return where;
}

export default {
  searchMin,
  searchMax,
  searchString,
  searchList,
  generateWhere,
};
