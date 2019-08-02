import { EntityFilterQuery } from '../../../../src/interfaces'
import { CommandStateEnum } from '../business/be/CommandStateEnum'

export interface CommandeFilterQuery extends EntityFilterQuery {
   'customer.id'?: number
   state?: CommandStateEnum
   reference?: string
  'deliveryDatas.deliveryDate'?: {
    lte: Date
    gte: Date
  },
  'badfilter'?: string,
  'deliveryDatas.badfilter'?: string
}
