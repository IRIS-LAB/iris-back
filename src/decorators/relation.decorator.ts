import * as constants from '../constants'
import { RelationEntity } from '../enums'
import { RelationMetadata } from '../interfaces/relation-metadata.interface'

const assignMetadata = (args: { [key: string]: RelationMetadata } = {}, field: string, relation: RelationEntity, type: RelationMetadata['type']): { [key: string]: RelationMetadata } => ({
  ...args,
  [field]: {
    ...(args[field] || {}),
    relation,
    type,
  },
})

/**
 * Relation decorator used to construct API response and DAO request.
 * @param relation - Type of the relation
 * @param type - Type of the field (required for arrays)
 * @deprecated - prefer the use of the eager option of the typeorm relation with the @NotExposed annotation if necessary
 */
export function Relation(relation: RelationEntity, type?: RelationMetadata['type']): PropertyDecorator {
  return (targetClass, propertyKey) => {
    const args: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, targetClass.constructor)
    if (!type && Reflect.getMetadata('design:type', targetClass, propertyKey) === Array) {
      throw new Error('Please set element type of Array in @Relation 2nd parameter')
    }

    Reflect.defineMetadata(constants.RELATION_METADATA, assignMetadata(args, propertyKey.toString(), relation, type!), targetClass.constructor)
  }
}
