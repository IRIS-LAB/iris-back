import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ErrorProvider } from '../../../../src/modules/iris-module/providers'
import { IrisDAO } from '../../../../src/services/data'
import { CommandBE } from '../../objects/business/be/CommandBE'
import { CommandeFilterQuery } from '../../objects/filter/CommandFilterQuery'

@Injectable()
export class CommandDAO extends IrisDAO<CommandBE, CommandeFilterQuery> {
  constructor(@InjectRepository(CommandBE) commandRepository: Repository<CommandBE>, errorProvider: ErrorProvider) {
    super(commandRepository, errorProvider)
  }
}
