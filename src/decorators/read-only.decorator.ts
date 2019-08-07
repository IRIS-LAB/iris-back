import * as constants from '../constants'
import { RelationMetadata } from '../interfaces/relation-metadata.interface'

const assignMetadata = (args: { [key: string]: RelationMetadata } = {}, field: string, readOnly: boolean): { [key: string]: RelationMetadata } => ({
  ...args,
  [field]: {
    ...(args[field] || {}),
    readOnly,
  },
})

/**
 * NotExposed() decorator used to hide field from controller response
 */
export function ReadOnly(): PropertyDecorator {
  return (targetClass, propertyKey) => {
    const args: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, targetClass.constructor)
    Reflect.defineMetadata(constants.RELATION_METADATA, assignMetadata(args, propertyKey.toString(), true), targetClass.constructor)
  }
}
