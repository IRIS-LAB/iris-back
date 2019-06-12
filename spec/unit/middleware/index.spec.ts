import express from 'express'
import request from 'supertest'
import { Logger, withMiddlewares } from '../../../src'


describe('Middleware withMiddlewares', () => {
  let app: any

  beforeEach(() => {
    app = withMiddlewares((a: express.Application) => {
      a.use('/:id', (req: express.Request, res: express.Response) => {
        res.send({ name: 'name', id: req.params.id })
      })
    }, Logger.createDefault())

  })
  it('should use actuator', () => {
    return request(app)
      .get('/actuator/health')
      .expect(200)
      .expect({ status: 'UP' })
  })

})
