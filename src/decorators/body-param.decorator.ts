import { ArgumentMetadata, Body, PipeTransform, Type } from '@nestjs/common'

export const BodyParam = (...pipes: Array<Type<PipeTransform> | PipeTransform>) => Body({
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata && metadata.metatype && metadata.metatype.prototype) {
      // @ts-ignore
      const joiMetadatas = Reflect.getMetadata('tsdv:working-schema', metadata.metatype.prototype)
      // TODO : check business validator
      // TODO : check relations

    }
    return value
  },
}, ...pipes)
