import express from 'express'
import request from 'supertest'
import { createLogger, transports } from 'winston'
import { middlewares } from '../../../src/middlewares'

// tslint:disable-next-line:no-var-requires
const pkg = require('../../../package.json')

describe('Middleware actuator', () => {
  let app: any

  beforeEach(() => {
    app = express()
    app.use('/actuator', middlewares.actuator(createLogger({ level: 'debug', transports: [new transports.Console()] })))
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return health UP', () => {
    // jest.doMock('typeorm', ({ 'getConnectionManager': () => ({ connections: [] }) }))

    return request(app)
      .get('/actuator/health')
      .expect(200)
      .expect({ status: 'UP' })
  })

  it('should return 404', () => {
    return request(app)
      .get('/bad_actuator/health')
      .expect(404)
  })

  it('should return info', () => {
    return request(app)
      .get('/actuator/info')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body.build).toBeDefined()
        expect(response.body.build.description).toEqual(pkg.description)
        expect(response.body.build.name).toEqual(pkg.name)
        expect(response.body.build.version).toEqual(pkg.version)
      })
  })

  it('should return metrics', () => {
    return request(app)
      .get('/actuator/metrics')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body.mem).toBeDefined()
        expect(response.body.mem.heapTotal).toBeDefined()
        expect(response.body.mem.heapUsed).toBeDefined()
        expect(response.body.mem.rss).toBeDefined()
        expect(response.body.uptime).toBeDefined()
      })
  })
  it('should return missing path', () => {
    return request(app)
      .get('/actuator/other_metrics')
      .expect(404)
  })
})
