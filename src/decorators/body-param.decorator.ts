import { ArgumentMetadata, Body, PipeTransform, Type } from '@nestjs/common'
import * as constants from '../constants'
import { RelationEntity } from '../enums'
import { RelationMetadata } from '../interfaces/relation-metadata.interface'

export const BodyParam = (noMapping?: boolean, ...pipes: Array<Type<PipeTransform> | PipeTransform>) => Body({
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata && metadata.metatype && metadata.metatype.prototype) {
      return filterObject(value, metadata.metatype.prototype)
    }
    return value
  },
}, ...pipes)

function filterObject(object: any, prototype?: any): any {
  // TODO : convert Date
  // TODO : implement @ReadOnly()
  if (typeof object === 'object') {

    const joiMetadatas = Reflect.getMetadata('tsdv:working-schema', prototype)
    const relationMetadatas: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, prototype.constructor)

    if (Array.isArray(object)) {
      return object.map(o => filterObject(o, prototype))
    }
    const result: any = prototype && prototype.constructor ? new prototype.constructor() : {}
    for (const propertyKey of Object.keys(object)) {
      const relationMetadata = relationMetadatas ? relationMetadatas[propertyKey] : null
      const joiMetadata = joiMetadatas ? joiMetadatas[propertyKey] : null
      const value = object[propertyKey]
      if (typeof value !== 'undefined') {
        if (relationMetadata) {
          let propertyPrototype
          if (!propertyPrototype && relationMetadata && relationMetadata.type && relationMetadata.type.prototype) {
            propertyPrototype = relationMetadata.type
          }
          if (!propertyPrototype && prototype && prototype.constructor && prototype) {
            propertyPrototype = Reflect.getMetadata('design:type', prototype, propertyKey)
          }
          if (relationMetadata.relation === RelationEntity.ASSOCIATION) {
            result[propertyKey] = Array.isArray(value) ? value.map(o => ({ id: o.id })) : { id: value.id }
          } else if (relationMetadata.relation === RelationEntity.ENTITY) {
            result[propertyKey] = Array.isArray(value) ? value.map(o => ({
              ...filterObject(o, propertyPrototype ? propertyPrototype.prototype : null),
              id: o.id,
            })) : {
              ...filterObject(value, propertyPrototype ? propertyPrototype.prototype : null),
              id: value.id,
            }
          }

        } else if (joiMetadata) {
          result[propertyKey] = value
        }
      }
    }
    return result

  } else {
    return object
  }
}
