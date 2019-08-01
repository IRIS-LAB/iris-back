import { CommandBE } from './objects/business/be/CommandBE'

export class FixturesUtils {
  public static commandsFixtures(count: number): CommandBE[] {
    const commands: CommandBE[] = []
    while (commands.length < count) {
      const id = commands.length + 1
      commands.push({
        id,
        amount: 0,
        billingAddress: {
          id,
          country: 'FRANCE',
          line1: 'line 1',
          line2: 'line 2',
        },
        commandLines: [
          {
            id: id * 10 + 1,
            quantity: 1,
            product: {
              id: 1,
              label: 'product 1',
              amount: 4.99,
            },
          },
          {
            id: id * 10 + 2,
            quantity: 3,
            product: {
              id: 2,
              label: 'product 2',
              amount: 19.90,
            },
          },
        ],
        customer: {
          id,
          name: `customer ${id}`,
          email: `user${id}@mycompany.com`,
        },
        reference: `REF.${id}`,
      })
    }
    return commands
  }
}
