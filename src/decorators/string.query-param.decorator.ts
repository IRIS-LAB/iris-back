import { TypeUtils } from '../utils'
import { QueryConverter } from './abstract.query-param.decorator'

export const StringQueryParam = QueryConverter<string>(value => {
  return TypeUtils.convertToType(TypeUtils.TYPE.STRING, value) as string
})
