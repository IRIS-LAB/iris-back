import { EntityFilterQuery } from '../../../../src/interfaces'
import { OrderState } from '../business/be/OrderState'

export interface OrderFilterQuery extends EntityFilterQuery {
   'customer.id'?: number
   state?: OrderState
   reference?: string
  'deliveryData.deliveryDate'?: {
    lte: Date
    gte: Date
  },
  'badfilter'?: string,
  'deliveryData.badfilter'?: string
}
