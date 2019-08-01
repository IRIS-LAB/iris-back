import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity(`PRODUCT`)
export class ProductBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'LABEL' })
  public label: string

  @Column({ name: 'AMOUNT', nullable: false, type: 'float' })
  public amount: number
}
