import { Column } from 'typeorm'

export class DeliveryDatasBEP {
  @Column({ name: 'DELIVERY_DATE', nullable: true })
  public deliveryDate?: Date

  @Column({ name: 'DELIVERY_STREET', nullable: true })
  public deliveryStreet?: string

  @Column({ name: 'DELIVERY_ZIPCODE', nullable: true })
  public deliveryZipcode?: number

  @Column({ name: 'DELIVERY_CITY', nullable: true })
  public deliveryCity?: string
}
