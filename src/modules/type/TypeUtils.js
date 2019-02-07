import {BusinessException} from 'iris-common'
var moment = require('moment')

export const TypeUtils = {
/**
 * Enum type
 */
TYPE : {
	STRING : 'string',
	INT : 'int',
	DATE : 'date',
},

/**
 * Allows to transform the parameter into the type provided
 * @param {TYPE} type 
 * @param {String} param 
 */
async defineType (type , param) {
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
},

/**
 * Transforms string to int
 * @param {String} param 
 * 					a number
 */
async stringToIntBase10 (param) {
	let regInt = RegExp(/^\d+$/, 'g')
	if(!regInt.test(param)){
		throw new Error('number')
	}
	param = parseInt(param)
	return param
},

/**
 * Transforms string to date
 * @param {String} param 
 * 					a date
 */
async stringToDate (param) {
	try {
		if(!moment(param, moment.HTML5_FMT.DATETIME_LOCAL_MS, true).isValid()){
			throw new Error('date')
		}
		param = new Date(param)
		return param
	} catch (error) {
		throw error
	}
}
}