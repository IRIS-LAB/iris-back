import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ErrorProvider, LoggerProvider } from '../../../../src/modules/iris-module/providers'
import { IrisDAO } from '../../../../src/services/data'
import { OrderBE } from '../../objects/business/be/OrderBE'
import { OrderFilterQuery } from '../../objects/filter/OrderFilterQuery'

@Injectable()
export class OrderDAO extends IrisDAO<OrderBE, OrderFilterQuery> {
  constructor(@InjectRepository(OrderBE) orderRepository: Repository<OrderBE>, errorProvider: ErrorProvider, loggerProvider: LoggerProvider) {
    super(orderRepository, errorProvider, loggerProvider)
  }
}
