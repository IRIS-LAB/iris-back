import { TechnicalException } from '@u-iris/iris-common'
import { transports } from 'winston'
import { Logger } from '../../../src/logger'

// tslint:disable-next-line:no-var-requires
const pkg = require('../../../package.json')

describe('Logger', () => {
  describe('with default constructor', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })
    it('should log to console only', () => {
      const logger = Logger.createDefault()
      expect(logger).toBeDefined()
      expect(logger.transports).toHaveLength(1)
      expect(logger.transports[0]).toBeInstanceOf(transports.Console)
    })
  })
  describe('with options', () => {
    it('should throw exception because of no transports', () => {
      expect(() => Logger.create('debug', {
        appName: 'my-app',
        appVersion: '1.0.0',
        enableConsole: false
      })).toThrow(TechnicalException)
    })
  })
})
