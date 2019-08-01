import { Test, TestingModule } from '@nestjs/testing'
import '@u-iris/iris-common-test-utils'
import moment from 'moment'
import request from 'supertest'
import { CommandBE } from '../commons/objects/business/be/CommandBE'
import { CommandStateEnum } from '../commons/objects/business/be/CommandStateEnum'
import { CommandLBS } from '../commons/services/business/CommandLBS'
import { CommandDAO } from '../commons/services/data/CommandDAO'
import { TestUtils } from '../commons/test.utils'
import { DatabaseTestUtils } from './database-test-utils.service'
import './e2e-config-loader'
import { AppModule } from './module/testapp.module'

describe('CommandsEBS (e2e)', () => {
  let app
  let commandeLBS: CommandLBS
  let databaseTestUtils: DatabaseTestUtils
  let commandeDAO: CommandDAO

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [DatabaseTestUtils],
    }).compile()
    app = TestUtils.constructApplicationFromModule(moduleFixture)
    commandeLBS = moduleFixture.get<CommandLBS>(CommandLBS)
    commandeDAO = moduleFixture.get<CommandDAO>(CommandDAO)
    databaseTestUtils = moduleFixture.get<DatabaseTestUtils>(DatabaseTestUtils)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    TestUtils.cleanApplication()
  })

  beforeEach(async () => {
    await databaseTestUtils.cleanDatabase()
  })

  describe('/ (GET)', () => {
    it('should return empty list', () => {
      return request(app.getHttpServer())
        .get('/commands')
        .expect(200)
        .expect([])
    })

    it('should return list with 2 commands', async () => {
      const command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      await commandeLBS.createCommande(command1)

      const command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      await commandeLBS.createCommande(command2)

      return request(app.getHttpServer())
        .get('/commands')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(2)
          expect(response.body).toContainObjectLike({ reference: 'CMD.2' })
          expect(response.body).toContainObjectLike({ reference: 'CMD.1' })
        })
    })

    it('should return list with commands filtered by reference', async () => {
      const command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      await commandeLBS.createCommande(command1)

      const command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      await commandeLBS.createCommande(command2)

      return request(app.getHttpServer())
        .get('/commands?reference=CMD.2')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body).toContainObjectLike({ reference: 'CMD.2' })
          expect(response.header['accept-range']).toEqual('commands 100')
          expect(response.header['content-range']).toEqual('0-0/1')
          expect(response.header['x-page-element-count']).toEqual('1')
          expect(response.header['x-total-element']).toEqual('1')
          expect(response.header['x-total-page']).toEqual('1')
        })
    })

    it('should return list with commands ordered by reference asc', async () => {
      let command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      command1 = await commandeLBS.createCommande(command1)

      let command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      command2 = await commandeLBS.createCommande(command2)

      return request(app.getHttpServer())
        .get('/commands?sort=reference,asc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(2)
          expect(response.body[0].id).toEqual(command1.id)
          expect(response.body[1].id).toEqual(command2.id)
        })
    })

    it('should return list with commands ordered by reference desc', async () => {
      let command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      command1 = await commandeLBS.createCommande(command1)

      let command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      command2 = await commandeLBS.createCommande(command2)

      return request(app.getHttpServer())
        .get('/commands?sort=reference,desc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(2)
          expect(response.body[0].id).toEqual(command2.id)
          expect(response.body[1].id).toEqual(command1.id)
        })
    })

    it('should return list with commands filtered by statut', async () => {
      let command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      command1 = await commandeLBS.createCommande(command1)
      command1 = await commandeLBS.updateCommandState(command1.id as number, CommandStateEnum.PENDING)

      let command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      command2 = await commandeLBS.createCommande(command2)
      command2 = await commandeLBS.updateCommandState(command2.id as number, CommandStateEnum.PAID)

      return request(app.getHttpServer())
        .get('/commands?commandState=PENDING')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body).toContainObjectLike({ reference: 'CMD.1' })
          expect(response.header['accept-range']).toEqual('commands 100')
          expect(response.header['content-range']).toEqual('0-0/1')
          expect(response.header['x-page-element-count']).toEqual('1')
          expect(response.header['x-total-element']).toEqual('1')
          expect(response.header['x-total-page']).toEqual('1')
        })
    })

    it('should return error with commands filtered by bad statut', async () => {
      let command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      command1 = await commandeLBS.createCommande(command1)
      command1 = await commandeLBS.updateCommandState(command1.id as number, CommandStateEnum.PENDING)

      let command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      command2 = await commandeLBS.createCommande(command2)
      command2 = await commandeLBS.updateCommandState(command2.id as number, CommandStateEnum.PAID)

      return request(app.getHttpServer())
        .get('/commands?commandState=NONE')
        .expect(400)
        .expect('Content-Type', /json/)
        .then(response => {
          TestUtils.expectErreurReturned(response, {
            champErreur: 'commandState',
            codeErreur: 'parameter.type.invalid',
          })
        })
    })

    it('should return error with commands filtered by customer.id', async () => {
      let command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      command1 = await commandeLBS.createCommande(command1)

      let command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      command2 = await commandeLBS.createCommande(command2)

      return request(app.getHttpServer())
        .get('/commands?customer.id=3')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body[0].id).toEqual(command2.id)
        })
    })

    it('should return error with commands filtered by bad customer.id', async () => {
      let command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      command1 = await commandeLBS.createCommande(command1)

      let command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      command2 = await commandeLBS.createCommande(command2)

      return request(app.getHttpServer())
        .get('/commands?customer.id=fez51')
        .expect(400)
        .expect('Content-Type', /json/)
        .then(response => {
          TestUtils.expectErreurReturned(response, { champErreur: 'customer.id', codeErreur: 'type.number.wrong' })
        })
    })

    it('should return error with commands filtered by deliveryDatas.deliveryDate after', async () => {
      let command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      command1.deliveryDatas = { deliveryDate: moment('2019-01-01').toDate() }
      command1 = await commandeLBS.createCommande(command1)

      let command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      command2.deliveryDatas = { deliveryDate: moment('2019-02-01').toDate() }
      command2 = await commandeLBS.createCommande(command2)

      return request(app.getHttpServer())
        .get('/commands?deliveryDatas.deliveryDate.gte=2019-01-15T00:00:00.000')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body[0].id).toEqual(command2.id)
        })
    })

    it('should return error with commands filtered by deliveryDatas.deliveryDate before', async () => {
      let command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      command1.deliveryDatas = { deliveryDate: moment('2019-01-01').toDate() }
      command1 = await commandeLBS.createCommande(command1)

      let command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      command2.deliveryDatas = { deliveryDate: moment('2019-02-01').toDate() }
      command2 = await commandeLBS.createCommande(command2)

      return request(app.getHttpServer())
        .get('/commands?deliveryDatas.deliveryDate.lte=2019-01-15T00:00:00.000')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body[0].id).toEqual(command1.id)
        })
    })

    it('should return error with commands filtered by deliveryDatas.deliveryDate between order by deliveryDate desc', async () => {

      let command1: CommandBE = new CommandBE()
      command1.reference = 'CMD.1'
      command1.customer = { id: 5 }
      command1.deliveryDatas = { deliveryDate: moment('2019-01-01').toDate() }
      command1 = await commandeLBS.createCommande(command1)

      let command2: CommandBE = new CommandBE()
      command2.reference = 'CMD.2'
      command2.customer = { id: 3 }
      command2.deliveryDatas = { deliveryDate: moment('2019-02-01').toDate() }
      command2 = await commandeLBS.createCommande(command2)

      let command3: CommandBE = new CommandBE()
      command3.reference = 'CMD.3'
      command3.customer = { id: 3 }
      command3.deliveryDatas = { deliveryDate: moment('2019-03-01').toDate() }
      command3 = await commandeLBS.createCommande(command3)

      let command4: CommandBE = new CommandBE()
      command4.reference = 'CMD.4'
      command4.customer = { id: 5 }
      command4.deliveryDatas = { deliveryDate: moment('2019-04-01').toDate() }
      command4 = await commandeLBS.createCommande(command4)

      if (commandeDAO) {
        // none
      }
      return request(app.getHttpServer())
        .get('/commands?deliveryDatas.deliveryDate.gte=2019-01-15T00:00:00.000&deliveryDatas.deliveryDate.lte=2019-03-15T00:00:00.000&sort=deliveryDatas.deliveryDate,desc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(2)
          expect(response.body[0].id).toEqual(command3.id)
          expect(response.body[1].id).toEqual(command2.id)
        })
    })
  })

  describe('/:id (GET)', () => {
    it('should return 404 http status code', () => {
      return request(app.getHttpServer())
        .get('/commands/1')
        .expect(404)
        .then(response => {
          TestUtils.expectErreurReturned(response, { champErreur: 'commands', codeErreur: 'entity.not.found' })
        })
    })

    it('should return the command', async () => {
      let commande = new CommandBE()
      commande.reference = 'CMD.1'
      commande.commandLines = [
        {
          quantity: 1,
          product: {
            label: 'product 1',
            amount: 10,
          },
        },
        {
          quantity: 1,
          product: {
            label: 'product 2',
            amount: 4.99,
          },
        },
      ]
      commande.customer = {
        id: 54,
        name: 'customer name',
      }
      commande = await commandeLBS.createCommande(commande)

      return request(app.getHttpServer())
        .get('/commands/' + commande.id)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toBeDefined()
          expect(response.body.id).toEqual(commande.id)
          expect(response.body.reference).toEqual(commande.reference)
          expect(response.body.amount).toBeDefined()
          expect(response.body.customer).toBeDefined()
          expect(response.body.customer.id).toEqual(commande.customer.id)
          expect(response.body.customer.name).not.toBeDefined()
          expect(response.body.commandLines).toBeDefined()
          expect(response.body.commandLines).toHaveLength(2)
          for (const commandLine of response.body.commandLines) {
            expect(commandLine).toBeDefined()
            expect(commandLine.id).toBeDefined()
            expect(commandLine.quantity).not.toBeDefined()
            expect(commandLine.product).not.toBeDefined()
          }
        })
    })

    // it('should return the command with lignesCommandes.produit', async () => {
    //   let commande = new CommandBE()
    //   commande.id = 1
    //   commande.reference = 'CMD.1'
    //   commande.lignesCommandes = [
    //     {
    //       id: 1,
    //       libelle: 'ligne 1',
    //       prixUnitaire: 10,
    //       quantite: 1,
    //       produit: {
    //         libelle: 'produit 1',
    //         prixUnitaire: 10,
    //       },
    //     },
    //     {
    //       id: 2,
    //       libelle: 'ligne 2',
    //       prixUnitaire: 15,
    //       quantite: 1,
    //       produit: {
    //         libelle: 'produit 2',
    //         prixUnitaire: 4.99,
    //       },
    //     },
    //   ]
    //   commande.client = {
    //     id: 54,
    //     isMajeur: true,
    //     prenom: 'firstname',
    //     nom: 'lastname',
    //   }
    //   commande = await commandeLBS.createCommande(commande)
    //
    //   return request(app.getHttpServer())
    //     .get('/commands/' + commande.id + '?options=lignesCommandes.produit')
    //     .expect(200)
    //     .expect('Content-Type', /json/)
    //     .then(response => {
    //       expect(response.body).toBeDefined()
    //       expect(response.body.id).toEqual(commande.id)
    //       expect(response.body.libelle).toEqual(commande.libelle)
    //       expect(response.body.reference).toEqual(commande.reference)
    //       expect(response.body.montant).toBeDefined()
    //       expect(response.body.client).toBeDefined()
    //       expect(response.body.client.id).toEqual(commande.client.id)
    //       expect(response.body.lignesCommandes).toBeDefined()
    //       expect(response.body.lignesCommandes).toHaveLength(2)
    //       for (const ligneCommande of response.body.lignesCommandes) {
    //         expect(ligneCommande).toBeDefined()
    //         expect(ligneCommande.id).toBeDefined()
    //         expect(ligneCommande.libelle).toBeDefined()
    //         expect(ligneCommande.prixUnitaire).toBeDefined()
    //         expect(ligneCommande.quantite).toBeDefined()
    //         expect(ligneCommande.montant).toBeDefined()
    //         expect(ligneCommande.produit).toBeDefined()
    //         expect(ligneCommande.produit.id).toBeDefined()
    //         expect(ligneCommande.produit.libelle).toBeDefined()
    //         expect(ligneCommande.produit.prixUnitaire).toBeDefined()
    //       }
    //       expect(response.body.client.isMajeur).not.toBeDefined()
    //       expect(response.body.client.prenom).not.toBeDefined()
    //       expect(response.body.client.nom).not.toBeDefined()
    //     })
    // })

    // it('should return error because of option not allowed', async () => {
    //   return request(app.getHttpServer())
    //     .get('/commands/' + commande.id + '?options=client')
    //     .expect(400)
    //     .expect('Content-Type', /json/)
    //     .then(response => {
    //       TestUtils.expectErreurReturned(response, { champErreur: 'options', codeErreur: 'option.not.allowed' })
    //     })
    // })

  })

  describe('/ (POST)', () => {
    it('should return error because of empty reference', () => {
      return request(app.getHttpServer())
        .post('/commands')
        .send({})
        .set('Accept', 'application/json')
        .expect(400)
        .then(response => {
          TestUtils.expectErreurReturned(response, {champErreur: 'reference', codeErreur: 'any.required'})
        })
    })

    it('should return new command', () => {
      return request(app.getHttpServer())
        .post('/commands')
        .send({ reference: 'ref', customer: { id: 5 } })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then(response => {
          expect(response.body).toBeDefined()
          expect(response.body.id).toBeDefined()
          expect(response.body.reference).toEqual('ref')
          expect(response.body.customer).toBeDefined()
          expect(response.body.customer.id).toEqual(5)
        })
    })
  })

})
