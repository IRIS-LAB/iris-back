import { EntityMetadata, RemoveOptions, Repository, SelectQueryBuilder } from 'typeorm'
import * as constants from '../../constants'
import { RelationEntity } from '../../enums'
import { EntityFilterQuery, EntityOptions, PaginatedEntitiesOptions } from '../../interfaces'
import { RelationMetadata } from '../../interfaces/relation-metadata.interface'
import { ErrorProvider } from '../../modules/iris-module/providers'
import { TypeormQueryBuilder, TypeormUtils } from '../../utils'

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
   */
  constructor(protected readonly repository: Repository<T>, protected readonly errorProvider: ErrorProvider) {
  }

  /**
   * Find entities matching filters with pagination and sort and return list and count.
   * @param query - The query
   * @param filters - Functional filters
   */
  public async findWithPaginationResult(query?: PaginatedEntitiesOptions, filters?: Q): Promise<{ list: T[], count: number }> {
    const results = await this.createQueryBuilder(query, filters)
      .getManyAndCount()

    // const list = await this.repository.find(this.getFindManyOptions(query, filters))
    // const count = await this.repository.count(this.getFindManyOptions(query, filters))
    return { list: results[0], count: results[1] }
  }

  /**
   * Find entities matching filters with pagination and sort
   * @param query - The query
   * @param filters - Functional filters
   */
  public async find(query?: PaginatedEntitiesOptions, filters?: Q): Promise<T[]> {
    return this.createQueryBuilder(query, filters).getMany()
  }

  /**
   * Find entities in database matching query filters
   * @param query - Query passed by exposition service where filters are stored.
   * @param filters - Functional filters
   */
  public async count(query?: PaginatedEntitiesOptions, filters?: Q): Promise<number> {
    return this.createQueryBuilder(query, filters).getCount()
  }

  /**
   * Find an entity by ID
   * @param id - Id of the entity
   * @param query - Query passed by exposition service where filters are stored.
   */
  public async findById(id: number, query?: EntityOptions): Promise<T | undefined> {
    return this.createQueryBuilder(query, { id }).getOne()
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
  public createQueryBuilder(query?: PaginatedEntitiesOptions, filters?: Q & any): SelectQueryBuilder<T> {
    const queryBuilder = new TypeormQueryBuilder(this.repository)
    this.applyRelationsToQuerybuilder(queryBuilder)
    this.applyQueryFiltersToQueryBuilder(queryBuilder, filters)
    this.applySortOptionsToQuerybuilder(queryBuilder, query)
    this.applyPaginationOptionsToQuerybuilder(queryBuilder, query)
    return queryBuilder.getSelectQueryBuilder()

  }

  /**
   * Browser entity relations and call applyFn on relation marked as ASSOCIATION or ENTITY or enabled by options (from query parameter).
   * @param applyFn - function to call
   * @param query - query parameter with options
   */
  protected applyRelations(applyFn: (relation: string, metadata: RelationMetadata) => void, query?: EntityOptions): void {
    // Check @Relation()
    const entityRelations: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, (this.repository.target as any).prototype.constructor)
    if (entityRelations) {
      for (const key of Object.keys(entityRelations)) {
        const relation = entityRelations[key]
        // We fully load ASSOCIATION Relations. Unnecessary fields will be deleted by exposition interceptor
        if (relation.relation === RelationEntity.ENTITY || relation.relation === RelationEntity.ASSOCIATION || (query && query.options && query.options.indexOf(key) > -1)) {
          // Check if relation is managed by typeorm. Could be relative to XBE and then it should be managed manually in LBS
          if (TypeormUtils.isRelationValid(this.repository, key)) {
            // We add all relations that allow typeorm to load nested relations
            const splittedRelation = key.split('.')
            for (let index = 1; index <= splittedRelation.length; index++) {
              const relationToAdd = splittedRelation.slice(0, index).join('.')
              applyFn(relationToAdd, relation)
            }
          }
        }
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
    this.applyTypeormRelations(queryBuilder, this.repository.metadata)
    // Apply Iris relations
    this.applyRelations((relationToAdd, metadata) => {
      queryBuilder.withRelationToField(relationToAdd, true)
    }, query)
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

  private applyTypeormRelations(typeormQueryBuilder: TypeormQueryBuilder<T>, metadata: EntityMetadata, pathPrefix?: string):void {
    for (const relation of metadata.relations) {
      if(relation.isEager) {
        typeormQueryBuilder = typeormQueryBuilder.withRelationToField(`${pathPrefix ? pathPrefix + '.' : ''}${relation.propertyPath}`, true)
        this.applyTypeormRelations(typeormQueryBuilder, relation.inverseEntityMetadata, `${pathPrefix ? pathPrefix + '.' : ''}${relation.propertyPath}`)
      }
    }
  }
}
