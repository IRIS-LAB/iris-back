import { Controller, Get, INestApplication } from '@nestjs/common'
import '@u-iris/iris-common-test-utils'
import request from 'supertest'
import { NumberPathParam } from '../../../../../src/decorators'
import {
  ErrorProvider,
  IrisModule,
  PaginatedListResult,
  PaginatedResources,
  Resource,
} from '../../../../../src/modules/iris-module'
import { irisModuleOptionsForTests } from '../../../../commons/message-factory-for-tests'
import { CommandBE } from '../../../../commons/objects/business/be/CommandBE'
import { TestUtils } from '../../../../commons/test.utils'

@Controller('/commands')
class DefaultEBS {

  private static getCommands(): CommandBE[] {
    return [
      {
        id: 1,
        reference: 'REF1',
        billingAddress: {
          id: 1,
          line1: 'address 1',
          country: 'France',
        },
        customer: {
          id: 1,
          name: 'customer 1',
        },
        commandLines: [
          {
            id: 1,
            quantity: 1,
            product: {
              id: 1,
              label: 'product 1',
              amount: 4.99,
            },
          },
        ],
      },
    ].map(DefaultEBS.calculateAmount)
  }

  private static calculateAmount(command: CommandBE): CommandBE {
    command.commandLines.forEach(line => line.amount = line.product.amount * line.quantity)
    command.amount = command.commandLines.map(line => line.amount).reduce((amount, current) => amount! + current!, 0)!
    return command
  }

  constructor(private readonly errorProvider: ErrorProvider) {
  }

  @Get('/:id')
  @Resource(CommandBE)
  public async get(@NumberPathParam('id') id: number): Promise<CommandBE> {
    const command = DefaultEBS.getCommands().find(c => c.id === id)
    if (!command) {
      throw this.errorProvider.createEntityNotFoundBusinessException('commands', id)
    }
    return command
  }

  @Get('/')
  @PaginatedResources(CommandBE, 'commands', 10, 100)
  public async index(@NumberPathParam('id') id: number): Promise<PaginatedListResult<CommandBE>> {
    const commands = DefaultEBS.getCommands()
    return { list: commands, count: commands.length }
  }
}

describe('RelationOptionsInterceptor', () => {
  let app: INestApplication

  beforeAll(async () => {
    const bootstraped = await TestUtils.bootstrapNestJS({
      imports: [
        IrisModule.forRoot(irisModuleOptionsForTests),
      ],
      controllers: [
        DefaultEBS,
      ],
      providers: [],
    })

    app = bootstraped.app
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    TestUtils.cleanApplication()
  })

  it('should return result with default parameters', () => {
    return request(app.getHttpServer())
      .get('/commands/1')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual({
            id: 1,
            reference: 'REF1',
            amount: 4.99,
            billingAddress: {
              id: 1,
              line1: 'address 1',
              country: 'France',
            },
            commandLines: [
              {
                id: 1,
              },
            ],
            customer: {
              id: 1,
            },
          },
        )
      })
  })

  it('should return result with option commandLines', () => {
    return request(app.getHttpServer())
      .get('/commands/1?options=commandLines')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual({
            id: 1,
            reference: 'REF1',
            amount: 4.99,
            billingAddress: {
              id: 1,
              line1: 'address 1',
              country: 'France',
            },
            commandLines: [
              {
                id: 1,
                quantity: 1,
                amount: 4.99,
                product: {
                  id: 1,
                },
              },
            ],
            customer: {
              id: 1,
            },
          },
        )
      })
  })

  it('should return result with option commandLines.product', () => {
    return request(app.getHttpServer())
      .get('/commands/1?options=commandLines.product')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual({
            id: 1,
            reference: 'REF1',
            amount: 4.99,
            billingAddress: {
              id: 1,
              line1: 'address 1',
              country: 'France',
            },
            commandLines: [
              {
                id: 1,
                quantity: 1,
                amount: 4.99,
                product: {
                  id: 1,
                  label: 'product 1',
                  amount: 4.99,
                },
              },
            ],
            customer: {
              id: 1,
            },
          },
        )
      })
  })

  it('should return results with default parameters', () => {
    return request(app.getHttpServer())
      .get('/commands')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeDefined()
        expect(response.body).toEqual([{
            id: 1,
            reference: 'REF1',
            amount: 4.99,
            billingAddress: {
              id: 1,
              line1: 'address 1',
              country: 'France',
            },
            commandLines: [
              {
                id: 1,
              },
            ],
            customer: {
              id: 1,
            },
          }],
        )
      })
  })
})
