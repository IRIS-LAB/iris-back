import { BusinessException, ErreurDO } from '@u-iris/iris-common'
import * as express from 'express'
import URI from 'urijs'
import { PaginationOptions, PaginationQueryParameters } from '../interfaces'
import { TypeUtils } from './type.utils'

export class PaginationUtils {

  /**
   * Return options with page and size from request
   * @param req express request
   * @param nbMaxAllow max size allowed
   * @param defaultSize default size if not set in request
   */
  public static getPaginationParams(req: express.Request, nbMaxAllow: number, defaultSize: number): PaginationOptions {
    return PaginationUtils.checkPagination({ page: req.query.page, size: req.query.size }, nbMaxAllow, defaultSize)
  }

  /**
   * Generates headers and status for response
   * @param {String} type - data's type returned
   * @param {Number} nbMaxAllow - maximum number allow
   * @param {Number} defaultSize - default number of elements per page
   * @param {Number} elementCount - total number of elements
   * @param {Number} lengthResponse - number of elements in the answer
   * @param {Object} req - request (req)
   * @param {Object} res -response (res)
   */
  public static generateResponse(type: string, nbMaxAllow: number, defaultSize: number, elementCount: number, lengthResponse: number, req: express.Request, res: express.Response) {
    res.set(
      PaginationUtils.generateHeader(
        type,
        nbMaxAllow,
        elementCount,
        lengthResponse,
        req.headers.host + req.originalUrl,
        this.getPaginationParams(req, nbMaxAllow, defaultSize),
      ),
    )
    res.status(PaginationUtils.generateStatus(elementCount, lengthResponse))
  }

  /**
   * checks and defaults to the size and page.
   * checks if the size is less than the maximum number
   * @param {Object} queryParams - all query params (req.query)
   * @param {Number} nbMaxAllow - maximum number allow and it's default size
   * @param {Number} defaultSize - default's size
   */
  protected static checkPagination(queryParams: PaginationQueryParameters, nbMaxAllow: number, defaultSize: number): PaginationOptions {
    const queryOptions = PaginationUtils.checkDefaultSizeAndPage(defaultSize, queryParams)
    PaginationUtils.checkAcceptRange(queryOptions.size, nbMaxAllow)
    return queryOptions
  }

  /**
   * Generates headers for pagination
   * @param {String} resource - data's resource returned
   * @param {Number} nbMaxAllow - maximum number allow
   * @param {Number} elementCount - total number of elements
   * @param {Number} lengthResponse - number of elements in the answer
   * @param {String} hostname - hostname
   * @param {Object} queryParams - all query params (req.query)
   * @returns header's object
   *
   */
  protected static generateHeader(resource: string, nbMaxAllow: number, elementCount: number, lengthResponse: number, hostname: string, queryParams: PaginationOptions) {
    const minIndex = queryParams.page * queryParams.size
    const maxIndex = minIndex + lengthResponse - 1
    const totalPages = Math.ceil(elementCount / queryParams.size)

    let link = ''
    const cloneQueryParams = { ...queryParams }

    if (queryParams.page + 1 < totalPages) {
      cloneQueryParams.page++
      link = '<' + PaginationUtils.createUrl(hostname, cloneQueryParams) + '>; rel="next",'
      cloneQueryParams.page = queryParams.page
    }
    // prev link
    if (queryParams.page > 0) {
      cloneQueryParams.page--
      link += '<' + PaginationUtils.createUrl(hostname, cloneQueryParams) + '>; rel="prev",'
    }
    // last and first link
    let lastPage = 0
    if (totalPages > 0) {
      lastPage = totalPages
    }
    cloneQueryParams.page = lastPage - 1
    link += '<' + PaginationUtils.createUrl(hostname, cloneQueryParams) + '>; rel="last",'
    cloneQueryParams.page = 0
    link += '<' + PaginationUtils.createUrl(hostname, cloneQueryParams) + '>; rel="first"'
    return {
      'Accept-Range': resource + ' ' + nbMaxAllow,
      'Content-Range': minIndex + '-' + maxIndex + '/' + elementCount,
      'X-Page-Element-Count': lengthResponse,
      'X-Total-Element': elementCount,
      'X-Total-Page': totalPages,
      link,
    }
  }

  /**
   * Generates response's status
   * @param {Number} nbMaxElement - maximum number of returned items you allow
   * @param {Number} nbElement - number of elements returned
   * @returns status number
   */
  protected static generateStatus(nbMaxElement: number, nbElement: number) {
    return nbMaxElement <= nbElement ? 200 : 206
  }

  /**
   * checks if the size is less than the maximum number
   * @param {Number} size
   * @param {Number} nbMaxAllow - maximum number allow
   */
  protected static checkAcceptRange(size: number, nbMaxAllow: number) {
    if (size > nbMaxAllow) {
      throw new BusinessException(new ErreurDO('size', 'max.exceeded', `The size query params must be lesser than ${nbMaxAllow}`),
      )
    }
  }

  /**
   * checks and defaults to the size and page
   * @param {Number} defaultSize - size by default
   * @param {Object} queryParams - all query params (req.query)
   */
  protected static checkDefaultSizeAndPage(defaultSize: number, queryParams: PaginationQueryParameters): PaginationOptions {
    const queryOptions = {
      page: queryParams.page ? TypeUtils.stringToIntBase10(queryParams.page) : 0,
      size: queryParams.size ? TypeUtils.stringToIntBase10(queryParams.size) : defaultSize,
    }
    if (queryOptions.size <= 0) {
      throw new BusinessException(new ErreurDO('size', 'min.exceeded', 'The size query params must be greater than 0'))
    }
    return queryOptions
  }

  /**
   * Creates an url from a string and query parameters entered
   *
   * @param {String} url - the url of the API in a string
   * @param {Object} queryParams -  object that contains the name and corresponding data.ex: {lattitude = 0.45121354, longitude = 0.8745644}
   * @returns {URL} - URL with query params
   * @throws {TechnicalException} - URL isn't type string
   */
  protected static createUrl(url: string, queryParams?: any) {
    const newUrl = new URI(url)
    if (queryParams !== null) {
      newUrl.search(queryParams)
    }
    return newUrl
  }
}
