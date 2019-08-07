import { RelationEntity } from '../enums'

export interface RelationMetadata {
  type: new(...args: any[]) => any
  relation?: RelationEntity
  allowedOption?: boolean
  notExposed?: boolean
  readOnly?: boolean
}
