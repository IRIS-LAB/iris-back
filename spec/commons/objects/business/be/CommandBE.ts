import { BusinessValidator } from '@u-iris/iris-common'
import { Joi } from 'tsdv-joi/core'
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AllowedOptions, Relation } from '../../../../../src/decorators'
import { RelationEntity } from '../../../../../src/enums'
import { DeliveryDatasBEP } from '../bep/DeliveryDatasBEP'
import { CustomerXBE } from '../xbe/CustomerXBE'
import { AddressBE } from './AddressBE'
import { CommandLineBE } from './CommandLineBE'
import { CommandStateEnum } from './CommandStateEnum'

@Entity(`COMMANDE`)
@AllowedOptions('commandLines', 'commandLines.product', 'customer')
export class CommandBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'REFERENCE', length: 10 })
  @BusinessValidator(Joi.string().required())
  public reference: string

  @Column({ name: 'MONTANT', nullable: true, type: 'float' })
  @BusinessValidator(Joi.number())
  public amount?: number

  @Column({ name: 'STATE', nullable: false })
  @BusinessValidator(Joi.string().equal(Object.keys(CommandStateEnum).map(k => CommandStateEnum[k])))
  public state?: CommandStateEnum

  @Relation(RelationEntity.ASSOCIATION, CommandLineBE)
  @OneToMany(type => CommandLineBE, commandLines => commandLines.command, {
    eager: false,
    cascade: true,
  })
  public commandLines: CommandLineBE[]

  @Relation(RelationEntity.ENTITY)
  @ManyToOne(type => AddressBE, {
    eager: true,
    cascade: true,
  })
  public billingAddress: AddressBE

  @Column(type => DeliveryDatasBEP, {
    prefix: '',
  })
  public deliveryDatas?: DeliveryDatasBEP

  @Relation(RelationEntity.ASSOCIATION)
  @Column(type => CustomerXBE, {
    prefix: '',
  })
  public customer: CustomerXBE
}
