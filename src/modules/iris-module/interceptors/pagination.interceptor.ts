import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import express from 'express'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import * as constants from '../../../constants'
import { PaginationUtils } from '../../../utils'
import { PaginatedListResult } from '../interfaces'
import { ControllerResourceTypeMetadata } from '../interfaces/controller-resource-type-metadata.interface'

export class PaginationInterceptor<T> implements NestInterceptor<PaginatedListResult<T>, T[]> {
  private resource: string

  constructor(private readonly targetClass, private readonly defaultSize: number = 20, private readonly maxSize: number = 100) {

  }

  public intercept(context: ExecutionContext, next: CallHandler<PaginatedListResult<T>>): Observable<T[]> | Promise<Observable<T[]>> {
    if (!this.resource) {
      const metadata: ControllerResourceTypeMetadata<T> = Reflect.getMetadata(constants.CONTROLLER_RESOURCE_TYPE_METADATA, this.targetClass.constructor)
      if (!metadata) {
        throw new Error('You must add @ResourceController decorator on your class to use @PaginatedResources')
      }
      this.resource = metadata.resource
    }

    const ctx = context.switchToHttp()
    const request: express.Request = ctx.getRequest()
    const response: express.Response = ctx.getResponse()
    if (!request.__iris) {
      request.__iris = {}
    }
    request.__iris.maxSize = this.maxSize
    request.__iris.defaultSize = this.defaultSize

    return next
      .handle()
      .pipe(
        tap((result: PaginatedListResult<T>) => {
            PaginationUtils.generateResponse(this.resource, this.maxSize, this.defaultSize, result.count, result.list.length, request, response)
          },
        ))
      .pipe(
        map((result: PaginatedListResult<T>) =>
          result.list,
        ),
      )
  }

}
