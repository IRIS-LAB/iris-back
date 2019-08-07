import path from 'path'
import { IrisModuleOptions } from '../../../src/modules/iris-module'

// tslint:disable-next-line:no-var-requires
const pkg = require('../../../package.json')

export const testappIrisModuleOptions: IrisModuleOptions = {
  logger: {
    appName: pkg.name,
    appVersion: pkg.version,
    // @ts-ignore
    level: process.env.LOG_LEVEL || 'error',
    enableConsole: true,
    file: process.env.PATH_LOG_FILENAME
  },
  messagesSources: path.resolve(__dirname, '../../resources/i18n-test.properties')
}
