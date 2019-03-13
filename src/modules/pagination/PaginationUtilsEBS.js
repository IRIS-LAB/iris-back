import { TypeUtils } from '../type/typeUtils'
import { ErreurDO, BusinessException, TechnicalException } from '@u-iris/iris-common'
import { paginationUtilsEBSError } from '../../error'

/**
 * Generates headers for pagination
 * @param {String} type - data's type returned
 * @param {Number} nbMaxAllow - maximum number allow
 * @param {Number} elementCount - total number of elements
 * @param {Number} lengthResponse - number of elements in the answer
 * @param {Object} queryParams - all query params (req.query)
 * @returns header's object
 *
 */
function generateHeader(
  type,
  nbMaxAllow,
  elementCount,
  lengthResponse,
  hostname,
  queryParams
) {
  const minIndex = queryParams.page * queryParams.size
  const maxIndex = minIndex + lengthResponse - 1
  const totalPages = Math.ceil(elementCount / queryParams.size)

  let link = ''
  let cloneQueryParams = Object.assign({}, queryParams)

  if (queryParams.page + 1 < totalPages) {
    cloneQueryParams.page++
    link = '<' + createUrl(hostname, cloneQueryParams) + '>; rel="next",'
    cloneQueryParams.page = queryParams.page
  }
  // prev link
  if (queryParams.page > 0) {
    cloneQueryParams.page--
    link += '<' + createUrl(hostname, cloneQueryParams) + '>; rel="prev",'
  }
  // last and first link
  let lastPage = 0
  if (totalPages > 0) {
    lastPage = totalPages
  }
  cloneQueryParams.page = lastPage - 1
  link += '<' + createUrl(hostname, cloneQueryParams) + '>; rel="last",'
  cloneQueryParams.page = 0
  link += '<' + createUrl(hostname, cloneQueryParams) + '>; rel="first"'
  return {
    'Accept-Range': type + nbMaxAllow,
    'Content-Range': minIndex + '-' + maxIndex + '/' + elementCount,
    'X-Page-Element-Count': lengthResponse,
    'X-Total-Element': elementCount,
    'X-Total-Page': totalPages,
    link: link
  }
}

/**
 * Generates response's status
 * @param {Number} nbMaxElement - maximum number of returned items you allow
 * @param {Number} nbElement - number of elements returned
 * @returns status number
 */
function generateStatus(nbMaxElement, nbElement) {
  return nbMaxElement <= nbElement ? 200 : 206
}

/**
 * Generates headers and status for response
 * @param {String} type - data's type returned
 * @param {Number} nbMaxAllow - maximum number allow
 * @param {Number} elementCount - total number of elements
 * @param {Number} lengthResponse - number of elements in the answer
 * @param {Object} queryParams - all query params (req.query)
 * @param {Object} res -response
 */
function generateResponse(
  type,
  nbMaxAllow,
  elementCount,
  lengthResponse,
  hostname,
  queryParams,
  res
) {
  res.set(
    generateHeader(type, nbMaxAllow, elementCount, lengthResponse, hostname, queryParams)
  )
  res.status(generateStatus(nbMaxAllow, elementCount))
}

/**
 * Creates an url from a string and query parameters entered
 *
 * @param {String} url - the url of the API in a string
 * @param {Object} queryParams -  object that contains the name and corresponding data.ex: {lattitude = 0.45121354, longitude = 0.8745644}
 * @returns {URL} - URL with query params
 * @throws {TechnicalException} - URL isn't type string
 */
function createUrl(url, queryParams) {
  let newUrl
  if (typeof url === 'string') {
    newUrl = new URL(url)
  } else {
    throw new TechnicalException(new ErreurDO(paginationUtilsEBSError.createUrl.field, paginationUtilsEBSError.createUrl.code, paginationUtilsEBSError.createUrl.label))
  }
  if (queryParams !== null) {
    newUrl.search = new URLSearchParams(queryParams)
  }
  return newUrl
}

/**
 * checks if the size is less than the maximum number
 * @param {Number} size
 * @param {Number} nbMaxAllow - maximum number allow
 */
function checkAcceptRange(size, nbMaxAllow) {
  if (size > nbMaxAllow) {
    throw new BusinessException(new ErreurDO(paginationUtilsEBSError.checkAcceptRange.field, paginationUtilsEBSError.checkAcceptRange.code, paginationUtilsEBSError.checkAcceptRange.label))
  }
}

/**
 * checks and defaults to the size and page
 * @param {Number} defaultSize - size by default
 * @param {Object} queryParams - all query params (req.query)
 */
function checkDefaultSizeAndPage(defaultSize, queryParams) {
  try {
    queryParams.page = queryParams.page ? await TypeUtils.stringToIntBase10(queryParams.page) : 0
    queryParams.size = queryParams.size ? await TypeUtils.stringToIntBase10(queryParams.size) : defaultSize
    if (queryParams.size === 0) {
      throw new BusinessException(new ErreurDO(
         paginationUtilsEBSError.checkDefaultSizeAndPage.field,
         paginationUtilsEBSError.checkDefaultSizeAndPage.code,
         paginationUtilsEBSError.checkDefaultSizeAndPage.label))
    }
  } catch (error) {
      throw error
  }
}

/**
 * checks and defaults to the size and page.
 * checks if the size is less than the maximum number
 * @param {Object} queryParams - all query params (req.query)
 * @param {Number} nbMaxAllow - maximum number allow and it's default size
 */
function checkPagination(queryParams, nbMaxAllow) {
  try {
    await checkDefaultSizeAndPage(nbMaxAllow, queryParams)
    await checkAcceptRange(queryParams.size, nbMaxAllow)
  } catch (error) {
    throw error
  }
}

export default {
  generateHeader,
  generateStatus,
  generateResponse,
  createUrl,
  checkAcceptRange,
  checkDefaultSizeAndPage,
  checkPagination,
}
