import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { CommandBE } from './CommandBE'

@Entity(`ADDRESS`)
export class AddressBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'LINE1' })
  public line1: string

  @Column({ name: 'LINE2' })
  public line2?: string

  @Column({ name: 'COUNTRY' })
  public country: string

  @OneToMany(type => CommandBE, command => command.billingAddress, {
    eager: false,
    cascade: false,
  })
  public commands?: CommandBE[]
}
