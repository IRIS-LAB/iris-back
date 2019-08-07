import * as constants from '../constants'
import { RelationMetadata } from '../interfaces/relation-metadata.interface'

const assignMetadata = (args: { [key: string]: RelationMetadata } = {}, field: string, notExposed: boolean): { [key: string]: RelationMetadata } => ({
  ...args,
  [field]: {
    ...(args[field] || {}),
    notExposed,
  },
})

/**
 * NotExposed() decorator used to hide field from controller response
 */
export function NotExposed(): PropertyDecorator {
  return (targetClass, propertyKey) => {
    const args: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, targetClass.constructor)
    Reflect.defineMetadata(constants.RELATION_METADATA, assignMetadata(args, propertyKey.toString(), true), targetClass.constructor)
  }
}
