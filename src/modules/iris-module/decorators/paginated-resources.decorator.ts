import { NestInterceptor, UseInterceptors } from '@nestjs/common'
import { PaginationInterceptor, RelationOptionsInterceptor } from '../interceptors'

export const PaginatedResources = <T>(type: new(...args) => T, resourcesName: string, defaultSize: number, maxSize: number, ...interceptors: NestInterceptor[]): MethodDecorator => {
  return (target, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    return UseInterceptors(
      new RelationOptionsInterceptor(type),
      new PaginationInterceptor(resourcesName, defaultSize, maxSize),
      ...interceptors,
    )(target, propertyKey.toString(), descriptor)
  }
}
