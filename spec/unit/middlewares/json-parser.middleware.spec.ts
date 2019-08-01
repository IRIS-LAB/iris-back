import express from 'express'
import request from 'supertest'
import { createLogger, transports } from 'winston'
import { middlewares } from '../../../src'
import * as mock from './json-parser.middleware.mock'

describe('Middleware JSON Parser', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should find object in body request', () => {
    const app = express()
    app.use(middlewares(createLogger({ level: 'debug', transports: [new transports.Console()] })).parseJSON)
    app.post('/', (req: express.Request, res: express.Response) => {
      mock.expectAllIsFine(req.body)
      res.send({})
    })
    const callApi = jest.spyOn(mock, 'expectAllIsFine')
    callApi.mockImplementation(
      (body: any) => {
        expect(body).toBeDefined()
        expect(body).toBeInstanceOf(Object)
        expect(body.id).toEqual(1)
        expect(body.name).toEqual('my name')
        return
      })

    return request(app)
      .post('/')
      .send({ id: 1, name: 'my name' })
      .expect(200)
      .expect((response) => {
        expect(callApi).toBeCalledTimes(1)
        expect(callApi).toBeCalledWith({ id: 1, name: 'my name' })
      })
  })

  it('should get undefined as body', () => {
    const app = express()
    app.post('/', (req: express.Request, res: express.Response) => {
      mock.expectAllIsFine(req.body)
      res.send({})
    })
    const callApi = jest.spyOn(mock, 'expectAllIsFine')
    callApi.mockImplementation(
      (body: any) => {
        expect(body).not.toBeDefined()
        return
      })

    return request(app)
      .post('/')
      .send({ id: 1, name: 'my name' })
      .expect(200)
      .expect((response) => {
        expect(callApi).toBeCalledTimes(1)
        expect(callApi).toBeCalledWith(undefined)
      })
  })

})
