type BasicType = string | Date | number | undefined | null

export interface EntityFilterObject {
  gt?: Date | number
  gte?: Date | number
  lt?: Date | number
  lte?: Date | number
  eq?: BasicType
  in?: Array<string | Date | number>
  ne?: string | Date | number
  nin?:  Array<string | Date | number>
  like?: string
}

export type EntityFilter = BasicType | EntityFilterObject
