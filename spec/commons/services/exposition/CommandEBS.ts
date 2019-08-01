import { Get, Post } from '@nestjs/common'
import {
  BodyParam,
  DateQueryParam,
  EntityOptionsQueryParam,
  EnumQueryParam,
  NumberQueryParam,
  PaginatedResourcesQueryParam,
  PathParam,
  StringQueryParam,
} from '../../../../src/decorators'
import { EntityOptions, PaginatedResourcesOptions } from '../../../../src/interfaces'
import { PaginatedEntitiesOptionsFactory } from '../../../../src/modules/iris-module/commons'
import { PaginatedResources, Resource, ResourceController } from '../../../../src/modules/iris-module/decorators'
import { PaginatedListResult } from '../../../../src/modules/iris-module/interfaces'
import { CommandBE } from '../../objects/business/be/CommandBE'
import { CommandStateEnum } from '../../objects/business/be/CommandStateEnum'
import { CommandLBS } from '../business/CommandLBS'

@ResourceController(CommandBE, '/commands')
export class CommandEBS {

  constructor(private readonly commandLBS: CommandLBS) {
  }

  @Get('/')
  @PaginatedResources(10, 100)
  public async findAll(@PaginatedResourcesQueryParam() paginatedResourcesOptions: PaginatedResourcesOptions,
                       @NumberQueryParam('customer.id') idClient: number,
                       @EnumQueryParam({
                         type: CommandStateEnum,
                         key: 'commandState',
                       }) statutCommande: CommandStateEnum,
                       @StringQueryParam('reference') reference: string,
                       @DateQueryParam('deliveryDatas.deliveryDate.gte') afterDateLivraison: Date,
                       @DateQueryParam('deliveryDatas.deliveryDate.lte') beforeDateLivraison: Date,
  ): Promise<PaginatedListResult<CommandBE>> {
    return this.commandLBS.findWithPaginationResult(PaginatedEntitiesOptionsFactory.withFilters(paginatedResourcesOptions, {
        'customer.id': idClient,
        'reference': reference,
        'state': statutCommande,
        'deliveryDatas.deliveryDate': {
          gte: afterDateLivraison,
          lte: beforeDateLivraison,
        }
      },
    ))
  }

  @Get('/:id')
  @Resource()
  public async findById(@EntityOptionsQueryParam() queryableParam: EntityOptions, @PathParam('id') id: number): Promise<CommandBE> {
    return this.commandLBS.findById(id, queryableParam)
  }

  @Post('/')
  @Resource()
  public async createCommande(@EntityOptionsQueryParam() queryableParam: EntityOptions, @BodyParam() newCommande: CommandBE): Promise<CommandBE> {
    return this.commandLBS.createCommande(newCommande, queryableParam)
  }
}
