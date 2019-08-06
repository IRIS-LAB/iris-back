import { Column } from 'typeorm'

export class CustomerXBE {

  @Column({ name: 'CUSTOMER_ID' })
  public id: number
  public name?: string
  public email?: string
}
