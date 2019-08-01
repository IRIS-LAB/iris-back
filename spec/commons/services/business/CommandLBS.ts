import { Injectable } from '@nestjs/common'
import { EntityOptions, PaginatedEntitiesOptions } from '../../../../src/interfaces'
import { PaginatedListResult } from '../../../../src/modules/iris-module/interfaces'
import { BusinessValidatorProvider, ErrorProvider } from '../../../../src/modules/iris-module/providers'
import { CommandBE } from '../../objects/business/be/CommandBE'
import { CommandStateEnum } from '../../objects/business/be/CommandStateEnum'
import { CommandeFilterQuery } from '../../objects/filter/CommandFilterQuery'
import { CommandDAO } from '../data/CommandDAO'
import { AmountCalculator } from './AmountCalculator'


@Injectable()
export class CommandLBS {

  constructor(private readonly businessValidatorProvider: BusinessValidatorProvider, private readonly commandDAO: CommandDAO, private readonly amountCalculator: AmountCalculator, private readonly errorProvider: ErrorProvider) {
  }

  public async findAll(query?: PaginatedEntitiesOptions<CommandeFilterQuery>): Promise<CommandBE[]> {
    return this.commandDAO.find(query)
  }

  public async count(query?: PaginatedEntitiesOptions<CommandeFilterQuery>): Promise<number> {
    return this.commandDAO.count(query)
  }

  public async findWithPaginationResult(query?: PaginatedEntitiesOptions<CommandeFilterQuery>): Promise<PaginatedListResult<CommandBE>> {
    return this.commandDAO.findWithPaginationResult(query)
  }

  public async findById(id: number, query?: EntityOptions): Promise<CommandBE> {
    const commande = await this.commandDAO.findById(id, query)
    if (!commande) {
      throw this.errorProvider.createEntityNotFoundBusinessException('commands', id)
    }
    return commande
  }

  public async createCommande(command: CommandBE, query?: EntityOptions): Promise<CommandBE> {
    command.state = CommandStateEnum.SAVED
    this.amountCalculator.calculateCommandAmount(command)
    command = this.businessValidatorProvider.validate(command)
    return this.commandDAO.save(command, query)
  }

  public async updateCommandState(commandId: number, commandState: CommandStateEnum): Promise<CommandBE> {
    const command = await this.commandDAO.findById(commandId)
    if (!command) {
      throw this.errorProvider.createEntityNotFoundBusinessException('command', commandId)
    }
    command.state = commandState
    return this.commandDAO.save(command)
  }
}
