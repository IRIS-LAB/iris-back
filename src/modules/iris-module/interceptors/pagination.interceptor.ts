import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import express from 'express'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { PaginationUtils } from '../../../utils'
import { PaginatedListResult } from '../interfaces'

export class PaginationInterceptor<T> implements NestInterceptor<PaginatedListResult<T>, T[]> {
  constructor(private readonly resource: string, private readonly defaultSize: number = 20, private readonly maxSize: number = 100) {

  }

  public intercept(context: ExecutionContext, next: CallHandler<PaginatedListResult<T>>): Observable<T[]> | Promise<Observable<T[]>> {
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
