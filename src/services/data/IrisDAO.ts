import {
  EntityMetadata,
  Equal,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  FindOperator,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm'
import * as constants from '../../constants'
import { RelationEntity } from '../../enums'
import {
  EntityFilterObject,
  EntityFilterQuery,
  EntityOptions,
  FindableQuery,
  PaginatedEntitiesOptions,
} from '../../interfaces'
import { RelationMetadata } from '../../interfaces/relation-metadata.interface'
import { ErrorProvider } from '../../modules/iris-module/providers'
import { FilterUtils } from '../../utils'


/**
 * Super class for DAO.
 */
export abstract class IrisDAO<T, Q extends EntityFilterQuery> {

  /**
   * Default constructor
   * @param repository - TypeORM repository
   * @param errorProvider - error factory
   */
  constructor(protected readonly repository: Repository<T>, protected readonly errorProvider: ErrorProvider) {
  }

  /**
   * Find entities matching filters with pagination and sort and return list and count.
   * @param query - The query
   */
  public async findWithPaginationResult(query?: PaginatedEntitiesOptions<Q>): Promise<{ list: T[], count: number }> {
    const list = await this.repository.find(this.getFindManyOptions(query))
    const count = await this.repository.count(this.getFindManyOptions(query))
    return { list, count }
  }

  /**
   * Find entities matching filters with pagination and sort
   * @param query - The query
   */
  public async find(query?: PaginatedEntitiesOptions<Q>): Promise<T[]> {
    return this.repository.find(this.getFindManyOptions(query))
  }

  /**
   * Find entities in database matching query filters
   * @param query - Query passed by exposition service where filters are stored.
   */
  public async count(query?: PaginatedEntitiesOptions<Q>): Promise<number> {
    return this.repository.count(this.getFindManyOptions(query))
  }

  /**
   * Find an entity by ID
   * @param id - Id of the entity
   * @param query - Query passed by exposition service where filters are stored.
   */
  public async findById(id: number, query?: EntityOptions): Promise<T | undefined> {
    return this.repository.findOne(id, this.getFindOneOptions(query))
  }

  /**
   * Save an entity into database
   * @param entity - Entity to save
   * @param query - Query passed by exposition service where filters are stored.
   */
  public async save(entity: T, query?: EntityOptions): Promise<T> {
    return this.repository.save(entity)
  }


  /**
   * Apply query filters
   * @param options - Query options that will be passed to find and count methods
   * @param query - Query passed by exposition service where filters are stored.
   */
  protected applyQueryFilters(options: FindableQuery<T>, query?: PaginatedEntitiesOptions<Q>) {
    if (query && query.filters) {
      for (const key of Object.keys(query.filters)) {
        const value = query.filters[key]

        if (typeof value !== 'undefined') {
          // Build with modifier
          if (typeof value === 'object') {
            const objectValue: EntityFilterObject = value as EntityFilterObject
            this.applyQueryOperator(options.where!, key, objectValue, 'gt', MoreThan)
            this.applyQueryOperator(options.where!, key, objectValue, 'gte', MoreThanOrEqual)
            this.applyQueryOperator(options.where!, key, objectValue, 'lt', LessThan)
            this.applyQueryOperator(options.where!, key, objectValue, 'lte', LessThanOrEqual)
            this.applyQueryOperator(options.where!, key, objectValue, 'like', Like)
            this.applyQueryOperator(options.where!, key, objectValue, 'in', In)
            this.applyQueryOperator(options.where!, key, objectValue, 'nin', Not, In)
            this.applyQueryOperator(options.where!, key, objectValue, 'eq', Equal)
            this.applyQueryOperator(options.where!, key, objectValue, 'ne', Not, Equal)
          } else {
            this.setValueAsNestedField(options.where, key, value)
          }
        }
      }
    }
  }

  /**
   * Apply query filters, sort options, pagination options and loading options and return findable query.
   * @param query - Query passed by exposition service
   */
  protected getFindManyOptions(query?: PaginatedEntitiesOptions<Q>): FindManyOptions<T> {

    const options: FindableQuery<T> = { where: {} }
    if (query && query.filters) {
      this.applyQueryFilters(options, query)
    }
    this.setSortOptions(options, query)
    this.setPaginationOptions(options, query)
    this.setLoadingOptions(options, query)
    return options
  }

  /**
   * Apply loading options and return findable options for findById method
   */
  protected getFindOneOptions(query?: EntityOptions): FindOneOptions<T> {
    const options: FindableQuery<T> = {}
    this.setLoadingOptions(options, query)
    return options
  }

  /**
   * Apply sortable options
   * @param options - Options where sortable fields are applied
   * @param query - Query passed by exposition service
   */
  protected setSortOptions(options: FindableQuery<T>, query?: PaginatedEntitiesOptions<Q>): void {
    if (query && query.sort) {
      if (!options.order) {
        options.order = {}
      }
      for (const sortable of query.sort) {
        // TODO : à partir de la version 0.3.0 de typeorm on pourra utiliser la fonction setValueAsNestedField
        // this.setValueAsDatabasenameField(options.order, sortable.field, sortable.direction === 'asc' ? 'ASC' : 'DESC')
        this.setValueAsNestedField(options.order, sortable.field, sortable.direction === 'asc' ? 'ASC' : 'DESC')
      }
    }
  }

  /**
   * Apply paginable options
   * @param options - Options where paginable options are applied
   * @param query - Query passed by exposition service
   */
  protected setPaginationOptions(options: FindableQuery<T>, query?: PaginatedEntitiesOptions<Q>): void {
    if (query && query.paginate) {
      options.skip = query.paginate.page * query.paginate.size
      options.take = query.paginate.size
    }
  }

  /**
   * Apply loading options from Relation and Option decorators from the BE
   * @param options - Options where loading options are applied
   * @param query  - Query passed by exposition service
   */
  protected setLoadingOptions(options: FindableQuery<T>, query?: EntityOptions): void {
    // Check @Relation()
    const entityRelations: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, (this.repository.target as any).prototype.constructor)
    if (entityRelations) {
      for (const key of Object.keys(entityRelations)) {
        const relation = entityRelations[key]
        // We fully load ASSOCIATION Relations. Unnecessary fields will be deleted by exposition interceptor
        if (relation.relation === RelationEntity.ENTITY || relation.relation === RelationEntity.ASSOCIATION || (query && query.options && query.options.indexOf(key) > -1)) {
          // Check if relation is managed by typeorm. Could be relative to XBE and then it should be managed manually in LBS
          if (this.isRelationValid(key)) {
            if (!options.relations) {
              options.relations = []
            }

            // We add all relations that allow typeorm to load nested relations
            const splittedRelation = key.split('.')
            for (let index = 1; index <= splittedRelation.length; index++) {
              const relationToAdd = splittedRelation.slice(0, index).join('.')
              if (options.relations.indexOf(relationToAdd) === -1) {
                options.relations.push(relationToAdd)
              }
            }
          }
        }
      }
    }
  }

  /**
   * Check nested typeorm relation validity
   * @param relationPath - Relation path
   * @param metadata - metadata for relation entity
   */
  protected isRelationValid(relationPath: string, metadata?: EntityMetadata): boolean {
    if (!metadata) {
      metadata = this.repository.metadata
    }
    const splittedRelations = relationPath.split('.')
    const closestRelationMetadata = metadata.relations.find(c => c.propertyPath === splittedRelations[0])
    return closestRelationMetadata !== undefined && (splittedRelations.length === 1 || this.isRelationValid(splittedRelations.slice(1).join('.'), this.repository.manager.connection.getMetadata(closestRelationMetadata.type)))
  }

  /**
   * Transform string field with dot separator into an object with nested fields and apply to o. (For example, 'field.nested' = 1 will result in {field: {nested: 1}}
   * @param o - The query parameter
   * @param fieldname - field
   * @param value - value
   */
  protected setValueAsNestedField(o: any, fieldname: string, value: any) {
    let temp = o
    const fields = fieldname.split('.')
    for (let i = 0; i < fields.length; i++) {
      const path = fields[i]
      if (i === fields.length - 1) {
        temp[path] = value
      } else {
        if (typeof temp[path] === 'undefined') {
          temp[path] = {}
        } else if (typeof temp[path] !== 'object') {
          throw this.errorProvider.createBusinessException(fieldname, 'field.not.accessible')
        }
      }
      temp = temp[path]
    }
  }


  private applyQueryOperator<K>(where: FindConditions<T>, key: string, filter: EntityFilterObject, filterOperator: keyof EntityFilterObject, ...operators: Array<(value: any | FindOperator<any>) => FindOperator<any>>) {
    if (FilterUtils.exists(filter, filterOperator)) {
      let o
      for (const operator of operators) {
        o = o ? operator(o) : operator
      }
      this.setValueAsNestedField(where, key, o((filter[filterOperator]!)))
    }
  }

}
