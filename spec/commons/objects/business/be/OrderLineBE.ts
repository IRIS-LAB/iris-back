import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { jf, Relation } from '../../../../../src/decorators'
import { RelationEntity } from '../../../../../src/enums'
import { OrderBE } from './OrderBE'
import { ProductBE } from './ProductBE'

@Entity(`ORDER_LINE`)
export class OrderLineBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'QUANTITY', nullable: false })
  @jf.number()
  public quantity: number

  @Column({ name: 'AMOUNT', nullable: false, type: 'float' })
  @jf.number()
  public amount?: number

  @Relation(RelationEntity.ASSOCIATION, () => ProductBE)
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

  @ManyToOne(type => OrderBE, order => order.orderLinesEntities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ORDER_ENTITY_ID' })
  public orderEntity?: OrderBE

  @ManyToOne(type => OrderBE, order => order.orderLinesEntities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ORDER_ENTITY_WITHOUT_RELATION_ID' })
  public orderEntityWithoutRelation?: OrderBE
}
