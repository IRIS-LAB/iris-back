import { Joi } from 'tsdv-joi/core'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BusinessValidator } from '../../../../../src/decorators'
import { OrderBE } from './OrderBE'

@Entity(`ADDRESS`)
export class AddressBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'LINE1' })
  @BusinessValidator(Joi.string().required())
  public line1: string

  @Column({ name: 'LINE2' })
  @BusinessValidator(Joi.string())
  public line2?: string

  @Column({ name: 'COUNTRY' })
  @BusinessValidator(Joi.string().required())
  public country: string

  @OneToMany(type => OrderBE, order => order.billingAddress, {
    eager: false,
    cascade: false,
  })
  public orders?: OrderBE[]
}
