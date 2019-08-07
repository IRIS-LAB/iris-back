import { TypeUtils } from '../utils'
import { QueryConverter } from './abstract.query-param.decorator'

export const DateQueryParam = QueryConverter<Date>(value => {
  return TypeUtils.convertToType(TypeUtils.TYPE.DATE, value) as Date
})
