import * as typeUtils from '../type/TypeUtils'
import {BusinessException, ErrorDO} from 'iris-common'

/**
 * Permits searching on a string with wildcards(*)
 * @param {Object} object 
 * 					JSON object that will be sent to mongo
 * @param {String} prop 
 * 					name of property
 * @param {String} param 
 * 					the string who is searching with wildcards
 */
export const searchStringObject = async (object , prop , param) =>{
	try {
		await checkNoInjection(param)
		let startWith = RegExp(/\*$/)
		let endWith = RegExp(/^\*/)
		//contains
		if( endWith.test(param) && startWith.test(param) ){
			param = param.replace(RegExp(/\*/, 'g'),'')
			object[prop] = {}
			object[prop]['$regex'] = new RegExp(param, 'i')
		}
		//end with
		else if(endWith.test(param)){
			param = param.replace(RegExp(/\*/, 'g'),'')
			object[prop] = {}
			object[prop]['$regex'] = new RegExp(param+'$', 'i')
		}
		//begin with
		else if(startWith.test(param)){
			param = param.replace(RegExp(/\*/, 'g'),'')
			object[prop] = {}
			object[prop]['$regex'] = new RegExp('^' + param , 'i')
		}else {
			object[prop] = param
		}
		
	} catch (error) {
		throw new BusinessException(new ErrorDO(prop , 'search.'+prop+'.string'))
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
export const searchMax = async (object, prop , param , type) => {
	try{
		await checkNoInjection(param)
		param = await typeUtils.defineType(type, param)
		if(!object[prop]){
			object[prop] = {}
		}
		object[prop]['$lte'] = param
	}catch (error){
		throw new BusinessException(new ErrorDO(prop , 'search.'+prop+'.'+error.message))
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
export const searchMin = async (object, prop , param , type) => {
	try{
		await checkNoInjection(param)
		param = await typeUtils.defineType(type, param)
		if(!object[prop]){
			object[prop] = {}
		}
		object[prop]['$gte'] = param
	}catch (error){
		throw new BusinessException(new ErrorDO(prop , 'search.'+prop+'.'+error.message))
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
export const searchList = async (object , prop , param , type) => {
	try {
		if(!object['$or'] ) {
			object['$or'] = []
	    }
	    for (let index = 0; index < param.length; index++) {
		   checkNoInjection(param)
		   const element = await typeUtils.defineType(type, param[index])
		   object.$or.push({[prop]:element})
	    }
	} catch (error) {
		throw new BusinessException(new ErrorDO(prop , 'search.'+prop+'.'+error.message))
	}
	
}
/**
 * Make sure there are no brackets.
 * @param {String} param 
 * 					paramater check
 */
export const checkNoInjection = async (param) => {
	if(RegExp(/[{}]/).test(param)){
		throw new Error('injection')
	}
}