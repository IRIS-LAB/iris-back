import { TypeUtils } from '../utils'
import { QueryConverter } from './abstract.query-param.decorator'

export const NumberQueryParam = QueryConverter<number>(value => {
  return TypeUtils.convertToType(TypeUtils.TYPE.INT, value) as number
})
