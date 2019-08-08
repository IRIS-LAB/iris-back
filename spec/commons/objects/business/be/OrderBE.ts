import { BusinessValidator } from '@u-iris/iris-common'
import { Joi } from 'tsdv-joi/core'
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AllowedOptions, Relation } from '../../../../../src/decorators'
import { RelationEntity } from '../../../../../src/enums'
import { DeliveryDataBEP } from '../bep/DeliveryDataBEP'
import { CustomerXBE } from '../xbe/CustomerXBE'
import { AddressBE } from './AddressBE'
import { OrderLineBE } from './OrderLineBE'
import { OrderState } from './OrderState'

@Entity(`ORDER`)
@AllowedOptions('orderLines', 'orderLines.product', 'customer')
export class OrderBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'REFERENCE', length: 10 })
  @BusinessValidator(Joi.string().required())
  public reference: string

  @Column({ name: 'AMOUNT', nullable: true, type: 'float' })
  @BusinessValidator(Joi.number())
  public amount?: number

  @Column({ name: 'STATE', nullable: false })
  @BusinessValidator(Joi.string().equal(Object.keys(OrderState).map(k => OrderState[k])))
  public state?: OrderState

  @Relation(RelationEntity.ASSOCIATION, () => OrderLineBE)
  @OneToMany(type => OrderLineBE, orderLines => orderLines.order, {
    eager: false,
    cascade: true,
  })
  public orderLines: OrderLineBE[]

  @Relation(RelationEntity.ENTITY)
  @ManyToOne(type => AddressBE, {
    eager: true,
    cascade: true,
  })
  public billingAddress: AddressBE

  @Column(type => DeliveryDataBEP, {
    prefix: '',
  })
  public deliveryData?: DeliveryDataBEP

  @Relation(RelationEntity.ASSOCIATION)
  @Column(type => CustomerXBE, {
    prefix: '',
  })
  public customer: CustomerXBE
}
