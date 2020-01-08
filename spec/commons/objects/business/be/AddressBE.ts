import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { jf } from '../../../../../src/decorators'
import { OrderBE } from './OrderBE'

@Entity(`ADDRESS`)
export class AddressBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'LINE1' })
  @jf.string().required()
  public line1: string

  @Column({ name: 'LINE2' })
  @jf.string()
  public line2?: string

  @Column({ name: 'COUNTRY' })
  @jf.string().required()
  public country: string

  @OneToMany(type => OrderBE, order => order.billingAddress, {
    eager: false,
    cascade: false,
  })
  public orders?: OrderBE[]
}
