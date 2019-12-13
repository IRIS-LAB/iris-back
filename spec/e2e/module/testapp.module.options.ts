import path from 'path'
import { IrisConfigOptions } from '../../../src/modules/config-module'

// tslint:disable-next-line:no-var-requires
const pkg = require('../../../package.json')

export const testappIrisModuleOptions: IrisConfigOptions = {
  logger: {
    appName: pkg.name,
    appVersion: pkg.version,
    // @ts-ignore
    level: process.env.LOG_LEVEL || 'error',
    enableConsole: true,
    file: process.env.PATH_LOG_FILENAME,
  },
  messagesSources: path.resolve(__dirname, '../../resources/i18n-test.properties'),
  actuatorOptions: {
    enablePing: false
  },
}
