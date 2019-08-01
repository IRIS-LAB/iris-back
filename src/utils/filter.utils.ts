import { EntityFilterObject } from '../interfaces'

export class FilterUtils {
  public static exists(filter: EntityFilterObject, key: keyof EntityFilterObject): boolean {
    return typeof filter === 'object' && typeof filter[key] !== 'undefined'
  }
}
