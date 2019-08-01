import { NestInterceptor, UseInterceptors } from '@nestjs/common'
import { PaginationInterceptor, RelationOptionsInterceptor } from '../interceptors'

export const PaginatedResources = <T>(defaultSize: number, maxSize: number, ...interceptors: NestInterceptor[]): MethodDecorator => {
  // TODO : define resource type here
  return (target, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    return UseInterceptors(
      new RelationOptionsInterceptor(target),
      new PaginationInterceptor(target, defaultSize, maxSize),
      ...interceptors,
    )(target, propertyKey.toString(), descriptor)
  }
}
