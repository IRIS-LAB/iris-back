import '@u-iris/iris-common-test-utils'
import 'reflect-metadata'
import * as constants from '../../../src/constants'
import { Relation } from '../../../src/decorators'
import { RelationEntity } from '../../../src/enums'
import { RelationMetadata } from '../../../src/interfaces/relation-metadata.interface'
import { CommandBE } from '../../commons/objects/business/be/CommandBE'
import { CommandLineBE } from '../../commons/objects/business/be/CommandLineBE'
import { ProductBE } from '../../commons/objects/business/be/ProductBE'
import { CustomerXBE } from '../../commons/objects/business/xbe/CustomerXBE'

describe('Decorator @Relation and @AllowedOptions', () => {
  it('should save relations with relation, allowedOption and type', () => {
    const commandesRelations: { [key: string]: RelationMetadata } = Reflect.getMetadata(constants.RELATION_METADATA, CommandBE)
    expect(Object.keys(commandesRelations)).toHaveLength(4)

    expect(commandesRelations.commandLines).toEqual({
      type: CommandLineBE,
      relation: RelationEntity.ASSOCIATION,
      allowedOption: true,
    })

    expect(commandesRelations['commandLines.product']).toEqual({
      allowedOption: true,
    })
    expect(Reflect.getMetadata('design:type', commandesRelations.commandLines.type.prototype, 'product')).toEqual(ProductBE)

    expect(commandesRelations.customer).toEqual({
      relation: RelationEntity.ASSOCIATION,
      allowedOption: true,
    })
    expect(Reflect.getMetadata('design:type', CommandBE.prototype, 'customer')).toEqual(CustomerXBE)

    expect(commandesRelations.billingAddress).toEqual({
      relation: RelationEntity.ENTITY,
    })
  })

  it('should throw error because of no type of array defined', () => {
    expect(() => {
      class AccountBE {
        @Relation(RelationEntity.ENTITY)
        public commands: CommandBE[]
      }

      return new AccountBE()
    }).toThrowError(new Error('Please set element type of Array in @Relation 2nd parameter'))
  })
})
