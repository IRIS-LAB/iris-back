import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Relation } from '../../../../../src/decorators'
import { RelationEntity } from '../../../../../src/enums'
import { CommandBE } from './CommandBE'
import { ProductBE } from './ProductBE'

@Entity(`COMMAND_LINE`)
export class CommandLineBE {

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


  @ManyToOne(type => CommandBE, command => command.commandLines)
  @JoinColumn({ name: 'COMMAND_ID' })
  public command?: CommandBE
}
