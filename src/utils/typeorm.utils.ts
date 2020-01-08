import { EntityMetadata, Repository } from 'typeorm'

export class TypeormUtils {

  /**
   * Check nested typeorm relation validity
   * @param repository
   * @param relationPath - Relation path
   * @param metadata - metadata for relation entity
   */
  public static getTypeormRelation<T>(repository: Repository<T>, relationPath: string, metadata?: EntityMetadata) {
    if (!metadata) {
      metadata = repository.metadata
    }
    const splittedRelations = relationPath.split('.')
    const closestRelationMetadata = (metadata.relations || []).find(c => c.propertyPath === splittedRelations[0])
    if (!closestRelationMetadata) {
      return undefined
    }
    return splittedRelations.length === 1 ? closestRelationMetadata : this.getTypeormRelation(repository, splittedRelations.slice(1).join('.')!, repository.manager.connection.getMetadata(closestRelationMetadata.type))
  }

  /**
   * Check nested typeorm relation validity
   * @param repository - typeorm repository
   * @param relationPath - Relation path
   * @param metadata - metadata for relation entity
   */
  public static isRelationValid<T>(repository: Repository<T>, relationPath: string, metadata?: EntityMetadata): boolean {
    return TypeormUtils.getTypeormRelation(repository, relationPath, metadata) !== undefined
  }

}