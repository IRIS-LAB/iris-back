import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Relation } from '../../../../../src/decorators'
import { RelationEntity } from '../../../../../src/enums'
import { OrderBE } from './OrderBE'
import { ProductBE } from './ProductBE'

@Entity(`ORDER_LINE`)
export class OrderLineBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'QUANTITY', nullable: false })
  public quantity: number

  @Column({ name: 'AMOUNT', nullable: false, type: 'float' })
  public amount?: number

  @Relation(RelationEntity.ASSOCIATION)
  @ManyToOne(type => ProductBE, {
    eager: true,
    cascade: true,
  })
  public product: ProductBE


  @ManyToOne(type => OrderBE, order => order.orderLines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ORDER_ID' })
  public order?: OrderBE
}
