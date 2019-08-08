import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import * as constants from '../../../constants'
import { RelationEntity } from '../../../enums'
import { RelationMetadata } from '../../../interfaces/relation-metadata.interface'
import { EntityOptionsFactory } from '../commons'
import { getErrorProvider } from '../iris.context'

/**
 * NestJS Interceptor to remove fields for NONE or ASSOTIATION Relations. ENTITY Relation should be managed by typeorm Query.
 */
export class RelationOptionsInterceptor<T> implements NestInterceptor<any, any> {

  constructor(private readonly type: new(...args) => T) {
  }

  public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const options = EntityOptionsFactory.getOptions(context.switchToHttp().getRequest())

    if (options) {
      // Check if option is valid
      for (const option of options) {
        // On vérifie que les options reçues sont autorisées sur le BE
        const relations: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, this.type.prototype.constructor)
        const relationMetadata = relations ? relations[option] : undefined
        if (!relationMetadata || !relationMetadata.allowedOption) {
          throw getErrorProvider().createBusinessException('options', 'option.not.allowed', {
            option,
            type: this.type.prototype.constructor.name,
          })
        }
      }
    }

    return next
      .handle()
      .pipe(
        map(result =>
          this.filterRelation(this.type.prototype, result, options),
        ),
      )
  }

  protected filterRelation(type, object: any, options?: string[], path = ''): any {

    if (Array.isArray(object)) {
      return object.map(o => this.filterRelation(type, o, options, path))
    }
    if (typeof object === 'object' && object !== null && typeof type !== 'undefined') {
      for (const propertyKey of Object.keys(object)) {
        const propertyPath = `${path ? `${path}.` : ''}${propertyKey}`


        if (typeof object[propertyKey] !== 'undefined') {

          let done = false
          const relations: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, type.constructor)
          const relationMetadata = relations ? relations[propertyKey] : undefined

          if (typeof relationMetadata !== 'undefined') {

            // If @NotExposed() then we delete object
            if (relationMetadata.notExposed) {
              delete object[propertyKey]
              done = true
            } else {
              switch (relationMetadata.relation) {
                case RelationEntity.NONE:
                  if (!this.optionExists(propertyPath, options)) {
                    delete object[propertyKey]
                    done = true
                  }
                  break
                case RelationEntity.ASSOCIATION:
                  if (!this.optionExists(`${propertyPath}`, options)) {
                    if (typeof object[propertyKey] !== 'undefined') {
                      if (typeof object[propertyKey] !== 'object') {
                        throw getErrorProvider().createTechnicalException(propertyKey, 'relation.invalid', new Error(), { relation: 'ASSOCIATION' })
                      }
                      object[propertyKey] = Array.isArray(object[propertyKey]) ? object[propertyKey].map(i => ({ id: i.id })) : { id: object[propertyKey].id }
                      done = true
                    }
                  }
                  break
              }
            }
          }

          if (!done) {
            let propertyPrototype
            if (!propertyPrototype && relationMetadata && relationMetadata.type && relationMetadata.type() && relationMetadata.type().prototype) {
              propertyPrototype = relationMetadata.type()
            }
            if (!propertyPrototype && type && type.constructor && type.constructor.prototype) {
              propertyPrototype = Reflect.getMetadata('design:type', type.constructor.prototype, propertyKey)
            }
            object[propertyKey] = this.filterRelation(propertyPrototype ? propertyPrototype.prototype : null, object[propertyKey], options, `${propertyPath}`)
          }

        }
      }
    }
    return object
  }

  /**
   * On vérifie si une option est concernée par un champ de propriété, qu'elle soit sur un sous-élément de la propriété ou sur la propriété elle-même.
   * @param propertyPath - le chemin d'accès à la propriété
   * @param options - les options récupérées de la couche exposition
   */
  protected optionExists(propertyPath: string, options?: string[]) {
    return options && options.find(o => o.startsWith(propertyPath)) !== undefined
  }
}
