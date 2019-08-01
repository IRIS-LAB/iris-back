import express from 'express'
import { EntityOptions } from '../../../interfaces/entity-options.interface'

export class EntityOptionsFactory {

  public static build(request: express.Request): EntityOptions {
    return { options: EntityOptionsFactory.getOptions(request) }
  }

  public static getOptions(request: express.Request): string[] {
    return request.query && request.query.options ? request.query.options.split(',').map(o => o.trim()) : null
  }
}
