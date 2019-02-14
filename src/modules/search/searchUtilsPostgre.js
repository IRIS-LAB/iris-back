/**
 * Add the search greater than or equal for a property
 * @param {String} prop
 *                  name of property
 * @param {TypeOfProp} param 
 *                  parameter for this property
 * @param {Object} objectWhere
 *              JSON object that will be sent to sequelize
 * @param {Operator} Op
 *                  Operator of sequelize (Sequelize.op)
 */
function searchMin(prop, param, objectWhere, Op) {
    checkObjectExist(objectWhere,prop)
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
   * @param {Operator} Op
   *                  Operator of sequelize (Sequelize.op)
   */
  function searchMax(prop, param, objectWhere, Op) {
    checkObjectExist(objectWhere,prop)
    objectWhere[prop][Op.lte] = param
  }
  
  /**
   * Permits searching on a string with wildcards(*)
   * @param {String} prop 
   * 					name of property
   * @param {String} param 
   * 					the string who is searching with wildcards
   * @param {Object} objectWhere
   *              JSON object that will be sent to sequelize
   * @param {Operator} Op
   *                  Operator of sequelize (Sequelize.op)
   */
  function searchString(prop, param, objectWhere, Op) {
    if (param.includes('*')) {
      param = param.replace(RegExp(/\*/, 'g'), '%')
      checkObjectExist(objectWhere,prop)
      objectWhere[prop][Op.iLike] = param
    } else {
      objectWhere[prop] = param
    }
  }
  
  /**
   * Add the search for a list for a property
   * @param {String} prop 
   * 					name of property
   * @param {String} param 
   * 					the string who is searching with wildcards
   * @param {Object} objectWhere
   *              JSON object that will be sent to sequelize
   * @param {Operator} Op
   *                  Operator of sequelize (Sequelize.op)
   */
  function searchList(prop, param, objectWhere, Op) {
    if (typeof param === 'string') {
      objectWhere[prop] = param
    } else if (typeof param === 'object') {
      checkObjectExist(objectWhere,prop)
      objectWhere[prop][Op.or] = []
      for (const key of param) {
        objectWhere[prop][Op.or].push(key)
      }
    }
  }
  
  function checkObjectExist(object,prop){
      if(!object[prop]){
          object[prop]= {}
      }
  }
  
  export const SearchUtilsPostgre = {
    searchMax,
    searchMin,
    searchString,
    searchList
  }