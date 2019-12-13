import path from 'path'
import { IrisConfigOptions } from '../../src/modules/config-module'

// tslint:disable-next-line:no-var-requires
const pkg = require('../../package.json')

export const irisModuleOptionsForTests: IrisConfigOptions = {
  logger: {
    appName: pkg.name,
    appVersion: pkg.version,
    level: 'debug',
    enableConsole: true,
  },
  messagesSources: path.resolve(__dirname, '../resources/i18n-test.properties'),
}
