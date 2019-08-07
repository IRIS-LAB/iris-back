import { FindConditions } from 'typeorm'

export interface FindableQuery<T> {
  where?: FindConditions<T>
  skip?: number
  take?: number
  order?: {
    [P in keyof T]?: 'ASC' | 'DESC' | 1 | -1;
  };

  /**
   * Indicates what relations of entity should be loaded (simplified left join form).
   */
  relations?: string[];

  /**
   * If sets to true then loads all relation ids of the entity and maps them into relation values (not relation objects).
   * If array of strings is given then loads only relation ids of the given properties.
   */
  loadRelationIds?: {
    relations?: string[];
    disableMixedMap?: boolean;
  }
}
