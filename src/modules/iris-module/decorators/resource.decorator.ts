import { NestInterceptor, UseInterceptors } from '@nestjs/common'
import { RelationOptionsInterceptor } from '../interceptors'

export const Resource = <T>(...interceptors: NestInterceptor[]): MethodDecorator => {
  // TODO : define resource type here
  return (target, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    return UseInterceptors(
      new RelationOptionsInterceptor(target),
      ...interceptors,
    )(target, propertyKey.toString(), descriptor)
  }
}
