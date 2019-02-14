import { TypeUtils } from '../type/typeUtils'
import { 
    ErrorDO,
    BusinessException,
    TechnicalException
} from '@ugieiris/iris-common'

/**
 * Generates headers for pagination
 * @param {String} type 
 *                  data's type returned
 * @param {Number} nbMaxAllow
 *                  maximum number allow
 * @param {Number} elementCount 
 *                  total number of elements
 * @param {Number} lengthResponse 
 *                  number of elements in the answer
 * @param {Object} queryParams
 *                  all query params (req.query) 
 * @returns header's object
 *                  
 */
async function generateHeader (type, nbMaxAllow , elementCount , lengthResponse , hostname, queryParams) {
    const minIndex = (queryParams.page * queryParams.size)
    const maxIndex = minIndex + lengthResponse - 1
    const totalPages = Math.ceil(elementCount / queryParams.size)
    
    let link = ""
    let cloneQueryParams = Object.assign({},queryParams)

    if ((queryParams.page + 1) < totalPages) {
        cloneQueryParams.page++
        link = "<" + createUrl( hostname ,cloneQueryParams ) + ">; rel=\"next\","
        cloneQueryParams.page = queryParams.page
    }
    // prev link
    if (queryParams.page > 0) {
        cloneQueryParams.page--
        link += "<" + createUrl( hostname ,cloneQueryParams ) + ">; rel=\"prev\","
    }
    // last and first link
    let lastPage = 0;
    if (totalPages > 0) {
        lastPage = totalPages;
    }
    cloneQueryParams.page = lastPage - 1
    link += "<" + createUrl( hostname ,cloneQueryParams ) + ">; rel=\"last\","
    cloneQueryParams.page = 0
    link += "<" + createUrl( hostname ,cloneQueryParams ) + ">; rel=\"first\""
    return {
        'Accept-Range' : type + nbMaxAllow,
        'Content-Range' : minIndex + '-'+ maxIndex + '/' + elementCount,
        'X-Page-Element-Count' : lengthResponse,
        'X-Total-Element': elementCount,
        'X-Total-Page': totalPages,
        'link': link
    }
}

/**
 * Generates response's status 
 * @param {Number} nbMaxElement
 *                 maximum number of returned items you allow
 * @param {Number} nbElement 
 *                  number of elements returned
 * @returns status number
 */
async function generateStatus (nbMaxElement , nbElement) {
    return nbMaxElement <= nbElement ? 200 : 206
}

/**
 * Generates headers and status for response
 * @param {String} type 
 *                  data's type returned
 * @param {Number} nbMaxAllow
 *                  maximum number allow
 * @param {Number} elementCount 
 *                  total number of elements
 * @param {Number} lengthResponse 
 *                  number of elements in the answer
 * @param {Object} queryParams
 *                  all query params (req.query) 
 * @param {Object} res
 *                  response 
 *            
 */
async function generatesResponse (type, nbMaxAllow , elementCount , lengthResponse , hostname, queryParams , res) {
    res.set(await generateHeader(type, nbMaxAllow , elementCount , lengthResponse , hostname, queryParams ))
    res.status(await generateStatus(elementCount,lengthResponse))
}

/**
 * Creates an url from a string and query parameters entered
 *
 * @param {String} url 
 *                  the url of the API in a string
 * @param {Object} queryParams 
 *                      object that contains the name and corresponding data. 
 *                      ex: {lattitude = 0.45121354, longitude = 0.8745644}
 * @returns {URL} 
 *                  URL with query params
 * @throws {Error} 
 *                  URL isn't type string
 */
async function createUrl (url, queryParams) {
    let newUrl
    if (typeof (url) === 'string') {
    newUrl = new URL(url)
    } else {
    throw new TechnicalException(new ErrorDO('url','pagination.url.string'))
    }
    if (queryParams !== null) {
    newUrl.search = new URLSearchParams(queryParams)
    }
    return newUrl
}

/**
 * checks if the size is less than the maximum number 
 * @param {Number} size 
 * @param {Number} nbMaxAllow 
 *                  maximum number allow
 */
async function checkAcceptRange (size , nbMaxAllow) {
    if( size > nbMaxAllow){
    throw new BusinessException('Accept-Range')   
    }
}

/**
 * checks and defaults to the size and page
 * @param {Object} queryParams
 *                  all query params (req.query) 
 */
async function checkDefaultSizeAndPage (queryParams) {
    try {    
        queryParams.page = queryParams.page ?  await TypeUtils.stringToIntBase10(queryParams.page) : 0
        queryParams.size = queryParams.size ?  await TypeUtils.stringToIntBase10(queryParams.size) : 2
        if(queryParams.size === 0){ 
            throw new BusinessException(new ErrorDO('size', 'pagination.size.greaterThan0'))
        } 
    } catch (error) {
        if (error instanceof BusinessException){
            throw new BusinessException([new ErrorDO('size', 'pagination.size.number'), new ErrorDO('page', 'pagination.page.number')])
        }else{
            throw error
        }
    }
}

/**
 * checks and defaults to the size and page.
 * checks if the size is less than the maximum number 
 * @param {Object} queryParams
 *                          all query params (req.query) 
 * @param {Number} nbMaxAllow 
 *                          maximum number allow
 */
async function StartOnPagination  (queryParams , nbMaxAllow) {
    try {
        await checkDefaultSizeAndPage(queryParams)
        await checkAcceptRange(queryParams.size, nbMaxAllow)     
    } catch (error) {
        throw error
    }
}

export const PaginationUtilsEBS = {
    generateHeader,
    generateStatus,
    generatesResponse,
    createUrl,
    checkAcceptRange,
    checkDefaultSizeAndPage,
    StartOnPagination
}
