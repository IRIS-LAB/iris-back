import { Controller } from '@nestjs/common'
import * as constants from '../../../constants'

/**
 * Decorate a NestJS controller for a resource Business Entity
 * @param type - type of the resource Business Entity
 * @param path - path for the controller
 * @param res - resource name
 */
export const ResourceController = <T>(type: new(...args) => T, path: string, res?: string): ClassDecorator => {
  return (targetClass) => {
    const resource = res || path.split('/').find(r => r !== null && r.length > 0)
    Reflect.defineMetadata(constants.CONTROLLER_RESOURCE_TYPE_METADATA, { type, resource }, targetClass)
    return Controller(path)(targetClass)
  }
}
