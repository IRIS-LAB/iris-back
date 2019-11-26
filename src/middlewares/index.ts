import { actuator } from './actuator.middleware'
import { enableCompression } from './compression.middleware'
import { enableCors } from './cors.middleware'
import { parseJSON } from './json-parser.middleware'
import { enableSecurity } from './security.middleware'

export const middlewares = {
  actuator,
  enableCompression,
  enableCors,
  parseJSON,
  enableSecurity
}
