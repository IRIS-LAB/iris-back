import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ErrorService, LoggerService } from '../../../../src/modules/iris-module/services'
import { IrisDAO } from '../../../../src/services/data'
import { OrderBE } from '../../objects/business/be/OrderBE'
import { OrderFilterQuery } from '../../objects/filter/OrderFilterQuery'

@Injectable()
export class OrderDAO extends IrisDAO<OrderBE, OrderFilterQuery> {
  constructor(@InjectRepository(OrderBE) orderRepository: Repository<OrderBE>, errorProvider: ErrorService, loggerProvider: LoggerService) {
    super(orderRepository, errorProvider, loggerProvider)
  }
}
