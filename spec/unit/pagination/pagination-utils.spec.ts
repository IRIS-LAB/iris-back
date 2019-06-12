import '@u-iris/iris-common-test-utils'
import express from 'express'
import request from 'supertest'
import { Logger } from '../../../src/logger'
import { middlewares } from '../../../src/middleware'
import { paginationUtils } from '../../../src/pagination'

describe('Pagination Utils', () => {
  let app: express.Application
  beforeEach(() => {
    app = express()
    app.get('/number', (req: express.Request, res: express.Response) => {
      const numbersInDatabase = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      const defaultSize = 10
      const maxSize = 100
      const params = paginationUtils.getPaginationParams(req, maxSize, defaultSize)
      const results = numbersInDatabase.slice(params.size * params.page, params.size * params.page + params.size)
      paginationUtils.generateResponse('number', maxSize, defaultSize, numbersInDatabase.length, results.length, req, res)
      res.send(results)
    })
    app.use(middlewares(Logger.createDefault()).errorHandler)
  })
  describe('generateResponse', () => {
    it('should return results with default parameters', () => {
      return request(app)
        .get('/number')
        .expect(206)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(10)
          expect(response.body).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
          expect(response.header['accept-range']).toEqual('number 100')
          expect(response.header['content-range']).toEqual('0-9/16')
          expect(response.header['x-page-element-count']).toEqual('10')
          expect(response.header['x-total-element']).toEqual('16')
          expect(response.header['x-total-page']).toEqual('2')
        })
    })
    it('should return results with parameters in query for page 0', () => {
      return request(app)
        .get('/number?page=0&size=5')
        .expect(206)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(5)
          expect(response.body).toEqual([1, 2, 3, 4, 5])
          expect(response.header['accept-range']).toEqual('number 100')
          expect(response.header['content-range']).toEqual('0-4/16')
          expect(response.header['x-page-element-count']).toEqual('5')
          expect(response.header['x-total-element']).toEqual('16')
          expect(response.header['x-total-page']).toEqual('4')
        })
    })
    it('should return results with parameters in query for page 2', () => {
      return request(app)
        .get('/number?page=2&size=5')
        .expect(206)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(5)
          expect(response.body).toEqual([11, 12, 13, 14, 15])
          expect(response.header['accept-range']).toEqual('number 100')
          expect(response.header['content-range']).toEqual('10-14/16')
          expect(response.header['x-page-element-count']).toEqual('5')
          expect(response.header['x-total-element']).toEqual('16')
          expect(response.header['x-total-page']).toEqual('4')
        })
    })
    it('should return all results with headers', () => {
      return request(app)
        .get('/number?size=50')
        .expect(200)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body).toHaveLength(16)
          expect(response.body).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
          expect(response.header['accept-range']).toEqual('number 100')
          expect(response.header['content-range']).toEqual('0-15/16')
          expect(response.header['x-page-element-count']).toEqual('16')
          expect(response.header['x-total-element']).toEqual('16')
          expect(response.header['x-total-page']).toEqual('1')
        })
    })
    it('should return error cause of size exceeded', () => {
      return request(app)
        .get('/number?size=101')
        .expect(400)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body.erreurs).toBeDefined()
          expect(response.body.erreurs).toBeInstanceOf(Array)
          expect(response.body.erreurs).toContainObjectLike({ champErreur: 'size', codeErreur: 'max.exceeded' })
        })
    })
    it('should return error cause of negative size', () => {
      return request(app)
        .get('/number?size=-1')
        .expect(400)
        .expect((response) => {
          expect(response.body).toBeDefined()
          expect(response.body.erreurs).toBeDefined()
          expect(response.body.erreurs).toBeInstanceOf(Array)
          expect(response.body.erreurs).toContainObjectLike({ champErreur: 'size', codeErreur: 'min.exceeded' })
        })
    })
  })
})
