import { TypeUtils } from '../utils'
import { QueryConverter } from './abstract.query-param.decorator'

export const StringQueryParam = QueryConverter<string>(value => {
  // TODO : parameter name is no longuer require. Get name of method parameter
  return TypeUtils.convertToType(TypeUtils.TYPE.STRING, value) as string
})
