import * as constants from '../constants'
import { RelationMetadata } from '../interfaces/relation-metadata.interface'

const assignMetadata = (args: { [key: string]: RelationMetadata } = {}, field: string, allowedOption: boolean): { [key: string]: RelationMetadata } => ({
  ...args,
  [field]: {
    ...(args[field] || {}),
    allowedOption
  }
})

export function AllowedOptions(...keys: string[]): ClassDecorator {
  return (targetClass) => {
    for (const k of keys) {
      const args: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, targetClass)
      Reflect.defineMetadata(constants.RELATION_METADATA, assignMetadata(args, k, true), targetClass)
    }
  }
}
