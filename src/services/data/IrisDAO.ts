import { EntityMetadata, RemoveOptions, Repository, SelectQueryBuilder } from 'typeorm'
import * as constants from '../../constants'
import { RelationEntity } from '../../enums'
import { EntityFilterQuery, EntityOptions, PaginatedEntitiesOptions } from '../../interfaces'
import { RelationMetadata } from '../../interfaces/relation-metadata.interface'
import { ErrorProvider, LoggerProvider } from '../../modules/iris-module/providers'
import { TypeormQueryBuilder } from '../../utils'

/**
 * IrisDAO.
 *
 * This class should be the parent class of all DAOs. It provides utility methods to query the database with entity filters and pagination parameters.
 */
export abstract class IrisDAO<T, Q extends EntityFilterQuery> {

  /**
   * Default constructor
   * @param repository - TypeORM repository
   * @param errorProvider - error factory
   * @param loggerProvider - logger provider
   */
  constructor(protected readonly repository: Repository<T>, protected readonly errorProvider: ErrorProvider, protected readonly loggerProvider: LoggerProvider) {
  }

  /**
   * Find entities matching filters with pagination and sort and return list and count.
   * @param filters? - Functional filters
   * @param query? - The query
   */
  public async findWithPaginationResult(filters?: Q, query?: PaginatedEntitiesOptions): Promise<{ list: T[]; count: number }> {
    const results = await this.createQueryBuilder(query, filters)
      .getManyAndCount()

    // const list = await this.repository.find(this.getFindManyOptions(query, filters))
    // const count = await this.repository.count(this.getFindManyOptions(query, filters))
    return { list: results[0], count: results[1] }
  }

  /**
   * Find entities matching filters with pagination and sort
   * @param filters? - Functional filters
   * @param query? - The query
   */
  public async find(filters?: Q, query?: PaginatedEntitiesOptions): Promise<T[]> {
    return this.createQueryBuilder(query, filters).getMany()
  }

  /**
   * Find entities in database matching query filters
   * @param filters? - Functional filters
   * @param query? - Query passed by exposition service where filters are stored.
   */
  public async count(filters?: Q, query?: PaginatedEntitiesOptions): Promise<number> {
    return this.createQueryBuilder(query, filters).getCount()
  }

  /**
   * Find an entity by ID
   * @param id - Id of the entity
   * @param query - Query passed by exposition service where filters are stored.
   */
  public async findById(id: number, query?: EntityOptions): Promise<T | undefined> {
    return this.findOne({ id }, query)
  }

  /**
   * Find an entity by ID
   * @param filters - filters of query
   * @param query - Query passed by exposition service where filters are stored.
   */
  public async findOne(filters?: any, query?: EntityOptions): Promise<T | undefined> {
    return this.createQueryBuilder(query, filters).getOne()
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
   * Remove an entity from database
   * @param entity - Entity to remove
   * @param options - options for remove operation
   */
  public async remove(entity: T, options?: RemoveOptions): Promise<T> {
    return this.repository.remove(entity, options)
  }

  /**
   * Create a query builder from current repository with relations, pagination and filters from the entity model and the query and filters parameters.
   * @param query - The query paginated options
   * @param filters - filters to apply
   */
  public createQueryBuilder(query?: PaginatedEntitiesOptions, filters?: any): SelectQueryBuilder<T> {
    const queryBuilder = new TypeormQueryBuilder(this.repository)
    this.applyRelationsToQuerybuilder(queryBuilder, query)
    this.applyQueryFiltersToQueryBuilder(queryBuilder, filters)
    this.applySortOptionsToQuerybuilder(queryBuilder, query)
    this.applyPaginationOptionsToQuerybuilder(queryBuilder, query)
    return queryBuilder.getSelectQueryBuilder()

  }

  /**
   * Browser entity relations and call applyFn on relation marked as ASSOCIATION or ENTITY or enabled by options (from query parameter).
   * @param applyFn - function to call
   * @param query - query parameter with options
   * @param maxDepths - max depths for circular dependencies
   * @param currentDepth - current depth from main entity
   * @param pathPrefix - path prefix from main entity
   * @param constructor - type of the current entity relation
   */
  // protected applyRelations(applyFn: (relation: string, metadata: RelationMetadata) => void, query?: EntityOptions, maxDepths = 5, currentDepth = 1, pathPrefix?: string, constructor?) {
  //   // Check @Relation()
  //   const entityRelations: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, constructor || (this.repository.target as any).prototype.constructor)
  //   if (entityRelations) {
  //     for (const key of Object.keys(entityRelations)) {
  //       const relation = entityRelations[key]
  //       // We fully load ASSOCIATION Relations. Unnecessary fields will be deleted by exposition interceptor
  //       const relationPath = (pathPrefix ? pathPrefix + '.' : '') + key
  //       if (relation.relation === RelationEntity.ENTITY || relation.relation === RelationEntity.ASSOCIATION || (query && query.options && query.options.indexOf(relationPath) > -1)) {
  //         // Check if relation is managed by typeorm. Could be relative to XBE and then it should be managed manually in LBS
  //         if (TypeormUtils.isRelationValid(this.repository, relationPath)) {
  //           // We add all relations that allow typeorm to load nested relations
  //           const splittedRelation = relationPath.split('.')
  //           for (let index = 1; index <= splittedRelation.length; index++) {
  //             const relationToAdd = splittedRelation.slice(0, index).join('.')
  //             applyFn(relationToAdd, relation)
  //           }
  //         }
  //         if (currentDepth < maxDepths) {
  //           const type = typeof relation.type === 'function' ? relation.type() : this.getTypeormTypeForRelation(relationPath)
  //           if (!type) {
  //             this.loggerProvider.warn(`Cannot find type for relation ${typeof this.repository.target === 'string' ? this.repository.target : this.repository.target.name}.${relationPath}`)
  //           } else {
  //             this.applyRelations(applyFn, query, maxDepths, currentDepth + 1, relationPath, type)
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  /**
   * Apply relations from Typeorm model and @Relation annotations.
   *
   * This will add relation to load and return in resultset if typeorm relation is eager or if iris relation is annotated with ENTITY or ASSOCIATION or if an option for the relation is passed in the query parameter.
   *
   * @param typeormQueryBuilder - the typeorm builder.
   * @param query - the query (with options).
   * @param metadata - the entity metadata to check relations to.
   * @param pathPrefix - the path prefix from the repository target to the entity.
   */
  private applyTypeormRelations(typeormQueryBuilder: TypeormQueryBuilder<T>, query?: EntityOptions, metadata?: EntityMetadata, pathPrefix?: string): void {
    const entityMetadata = metadata || this.repository.metadata
    const irisRelations: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, entityMetadata.target)
    for (const relation of entityMetadata.relations) {
      const irisRelation = irisRelations ? irisRelations[relation.propertyPath] : undefined
      const fullRelationPath = `${pathPrefix ? pathPrefix + '.' : ''}${relation.propertyPath}`

      if (relation.isEager || (irisRelation && (irisRelation.relation === RelationEntity.ENTITY || irisRelation.relation === RelationEntity.ASSOCIATION)) || (query && query.options && query.options.some(opt => opt === fullRelationPath || (opt.startsWith(fullRelationPath) && opt.substring(fullRelationPath.length, 1) === '.')))) {
        typeormQueryBuilder = typeormQueryBuilder.withRelationToField(fullRelationPath, true)
        this.applyTypeormRelations(typeormQueryBuilder, query, relation.inverseEntityMetadata, fullRelationPath)
      }
    }
  }

  private applySortOptionsToQuerybuilder(typeormQueryBuilder: TypeormQueryBuilder<T>, query?: PaginatedEntitiesOptions): void {
    if (query && query.sort && query.sort.length > 0) {
      const sort = query.sort.reduce((prev: any, current) => {
        prev[current.field] = current.direction === 'asc' ? 'ASC' : 'DESC'
        return prev
      }, {})
      typeormQueryBuilder.withOrderBy(sort)
    }
  }

  private applyPaginationOptionsToQuerybuilder(typeormQueryBuilder: TypeormQueryBuilder<T>, query?: PaginatedEntitiesOptions): void {
    if (query && query.paginate) {
      typeormQueryBuilder
        .withOffset(query.paginate.page * query.paginate.size)
        .withLimit(query.paginate.size)
    }
  }

  private applyRelationsToQuerybuilder(queryBuilder: TypeormQueryBuilder<T>, query?: EntityOptions): void {
    // Apply typeorm eager relations
    this.applyTypeormRelations(queryBuilder, query)
    // Apply Iris relations
    // this.applyRelations((relationToAdd, metadata) => {
    //   queryBuilder.withRelationToField(relationToAdd, true)
    // }, query)
  }

  /**
   * Check if a field exists in the model metadata
   * @param field - the field
   */
  private fieldExists(field: string) {
    return this.fieldExistsForEntityMetadata(field, this.repository.metadata)
  }

  /**
   * Check if a field is a part of entity metadata.
   * @param field - the field
   * @param metadata - the entity metadata
   */
  private fieldExistsForEntityMetadata(field: string, metadata: EntityMetadata) {
    return this.fieldExistsInMap(field, metadata.propertiesMap) || metadata.relations.some(relation => this.fieldExistsInRelation(field, relation))
  }

  /**
   * Check if a field exists in a propertiesMap.
   * @param field - the field
   * @param map - the propertiesMap
   */
  private fieldExistsInMap(field: string, map: any): boolean {
    const parts = field.split('.')
    const firstPart = parts.shift()
    return firstPart && map && map.hasOwnProperty(firstPart) && (parts.length === 0 || this.fieldExistsInMap(parts.join('.'), map[firstPart]))
  }

  /**
   * Check if a field is a part of a relation.
   * @param field - field path
   * @param relation - relation metadata
   */
  private fieldExistsInRelation(field: string, relation: any) {
    const parts = field.split('.')
    const firstPart = parts.shift()
    return firstPart && relation && (relation.propertyName === firstPart || relation.propertyPath === firstPart) && (parts.length === 0 || this.fieldExistsForEntityMetadata(parts.join('.'), relation.inverseEntityMetadata))
  }

  private applyQueryFiltersToQueryBuilder(typeormQueryBuilder: TypeormQueryBuilder<T>, filters?: Q): void {
    if (filters) {
      for (const key of Object.keys(filters)) {
        const value = filters[key]

        if (typeof value !== 'undefined') {
          if (!this.fieldExists(key)) {
            throw this.errorProvider.createTechnicalException(key, 'entity.field.invalid', new Error(), { type: typeof this.repository.target === 'function' ? this.repository.target.name : this.repository.target })
          }

          // Add left join
          typeormQueryBuilder.withFilter(key, value)
        }
      }
    }

  }

  // private getTypeormTypeForRelation(propertyPath: string, metadata?: EntityMetadata) {
  //   const parts = propertyPath.split('.')
  //   const firstPart = parts.shift()
  //   const relationFound = (metadata || this.repository.metadata).relations.find(r => r.propertyPath === firstPart)
  //   if (!relationFound) {
  //     return undefined
  //   }
  //   return parts.length === 0 ? relationFound.type : this.getTypeormTypeForRelation(parts.join('.'), relationFound.inverseEntityMetadata)
  // }
}
