import { Column } from 'typeorm'

export class CustomerXBE {

  @Column({ name: 'ID_CLIENT' })
  public id: number
  public name?: string
  public email?: string
}
