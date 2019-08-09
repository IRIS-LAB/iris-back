import { ArgumentMetadata, Body, PipeTransform, Type } from '@nestjs/common'
import * as constants from '../constants'
import { RelationEntity } from '../enums'
import { RelationMetadata } from '../interfaces/relation-metadata.interface'
import { TypeUtils } from '../utils'

export const BodyParam = (type?: new(...args: any[]) => any, ...pipes: Array<Type<PipeTransform> | PipeTransform>) => Body({
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata && metadata.metatype && metadata.metatype.prototype) {
      if (metadata.metatype === Array) {
        if (type) {
          return filterObject(value, type.prototype)
        } else {
          throw new Error('Please set element type of Array in @BodyParam')
        }
      }
      return filterObject(value, metadata.metatype.prototype)
    }
    return value
  },
}, ...pipes)

function filterObject(object: any, prototype?: any): any {
  if (typeof object === 'object') {
    if (Array.isArray(object)) {
      return object.map(o => filterObject(o, prototype))
    }

    const joiMetadatas = Reflect.getMetadata('tsdv:working-schema', prototype)

    const relationMetadatas: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, prototype.constructor)
    const result: any = prototype && prototype.constructor ? new prototype.constructor() : {}
    for (const propertyKey of Object.keys(object)) {
      const relationMetadata = relationMetadatas ? relationMetadatas[propertyKey] : null
      const joiMetadata = joiMetadatas ? joiMetadatas[propertyKey] : null
      const value = object[propertyKey]

      // If value is null or field is markes as readonly we don't map it to result
      if (typeof value !== 'undefined' && (!relationMetadata || !relationMetadata.readOnly)) {
        if (relationMetadata && relationMetadata.relation) {
          let propertyPrototype
          if (!propertyPrototype && relationMetadata && relationMetadata.type && relationMetadata.type() && relationMetadata.type().prototype) {
            propertyPrototype = relationMetadata.type().prototype
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
          result[propertyKey] = joiMetadata._type === 'date' ? TypeUtils.convertToType(TypeUtils.TYPE.DATE, value) : value
        }
      }
    }
    return result
  } else {
    return object
  }
}
