import './e2e-config-loader'

import { Test, TestingModule } from '@nestjs/testing'
import { EntityNotFoundBusinessException } from '@u-iris/iris-common'
import '@u-iris/iris-common-test-utils'
import moment from 'moment'
import request from 'supertest'
import { OrderBE } from '../commons/objects/business/be/OrderBE'
import { OrderState } from '../commons/objects/business/be/OrderState'
import { OrderLBS } from '../commons/services/business/OrderLBS'
import { OrderDAO } from '../commons/services/data/OrderDAO'
import { TestUtils } from '../commons/test.utils'
import { DatabaseTestUtils } from './database-test-utils.service'
import { AppModule } from './module/testapp.module'

describe('OrderEBS (e2e)', () => {
  let app
  let orderLBS: OrderLBS
  let databaseTestUtils: DatabaseTestUtils
  let orderDAO: OrderDAO

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [DatabaseTestUtils],
    }).compile()
    app = TestUtils.constructApplicationFromModule(moduleFixture)
    orderLBS = moduleFixture.get<OrderLBS>(OrderLBS)
    orderDAO = moduleFixture.get<OrderDAO>(OrderDAO)
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
        .get('/orders')
        .expect(200)
        .expect([])
    })

    it('should return list with 2 orders', async () => {
      const order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      await orderLBS.createOrder(order1)

      const order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      await orderLBS.createOrder(order2)

      return request(app.getHttpServer())
        .get('/orders')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(2)
          expect(response.body).toContainObjectLike({ reference: 'CMD.2' })
          expect(response.body).toContainObjectLike({ reference: 'CMD.1' })
        })
    })

    it('should return list with orders filtered by reference', async () => {
      const order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      await orderLBS.createOrder(order1)

      const order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      await orderLBS.createOrder(order2)

      return request(app.getHttpServer())
        .get('/orders?reference=CMD.2')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body).toContainObjectLike({ reference: 'CMD.2' })
          expect(response.header['accept-ranges']).toEqual('orders 100')
          expect(response.header['content-range']).toEqual('0-0/1')
          expect(response.header['x-page-element-count']).toEqual('1')
          expect(response.header['x-total-element']).toEqual('1')
          expect(response.header['x-total-page']).toEqual('1')
        })
    })

    it('should return list with orders ordered by reference asc', async () => {
      let order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      order1 = await orderLBS.createOrder(order1)

      let order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      order2 = await orderLBS.createOrder(order2)

      return request(app.getHttpServer())
        .get('/orders?sort=reference,asc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(2)
          expect(response.body[0].id).toEqual(order1.id)
          expect(response.body[1].id).toEqual(order2.id)
        })
    })

    it('should return list with orders ordered by reference desc', async () => {
      let order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      order1 = await orderLBS.createOrder(order1)

      let order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      order2 = await orderLBS.createOrder(order2)

      return request(app.getHttpServer())
        .get('/orders?sort=reference,desc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(2)
          expect(response.body[0].id).toEqual(order2.id)
          expect(response.body[1].id).toEqual(order1.id)
        })
    })

    it('should return list with orders filtered by statut', async () => {
      let order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      order1 = await orderLBS.createOrder(order1)
      order1 = await orderLBS.updateOrderState(order1.id as number, OrderState.PENDING)

      let order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      order2 = await orderLBS.createOrder(order2)
      order2 = await orderLBS.updateOrderState(order2.id as number, OrderState.PAID)

      return request(app.getHttpServer())
        .get('/orders?orderState=PENDING')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body).toContainObjectLike({ reference: 'CMD.1' })
          expect(response.header['accept-ranges']).toEqual('orders 100')
          expect(response.header['content-range']).toEqual('0-0/1')
          expect(response.header['x-page-element-count']).toEqual('1')
          expect(response.header['x-total-element']).toEqual('1')
          expect(response.header['x-total-page']).toEqual('1')
        })
    })

    it('should return error with orders filtered by bad statut', async () => {
      let order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      order1 = await orderLBS.createOrder(order1)
      order1 = await orderLBS.updateOrderState(order1.id as number, OrderState.PENDING)

      let order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      order2 = await orderLBS.createOrder(order2)
      order2 = await orderLBS.updateOrderState(order2.id as number, OrderState.PAID)

      return request(app.getHttpServer())
        .get('/orders?orderState=NONE')
        .expect(400)
        .expect('Content-Type', /json/)
        .then(response => {
          TestUtils.expectErreurReturned(response, {
            field: 'orderState',
            code: 'parameter.type.invalid',
          })
        })
    })

    it('should return error with orders filtered by customer.id', async () => {
      let order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      order1 = await orderLBS.createOrder(order1)

      let order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      order2 = await orderLBS.createOrder(order2)

      return request(app.getHttpServer())
        .get('/orders?customer.id=3')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body[0].id).toEqual(order2.id)
        })
    })

    it('should return error with orders filtered by bad customer.id', async () => {
      let order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      order1 = await orderLBS.createOrder(order1)

      let order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      order2 = await orderLBS.createOrder(order2)

      return request(app.getHttpServer())
        .get('/orders?customer.id=fez51')
        .expect(400)
        .expect('Content-Type', /json/)
        .then(response => {
          TestUtils.expectErreurReturned(response, { field: 'customer.id', code: 'type.number.invalid' })
        })
    })

    it('should return error with orders filtered by deliveryData.deliveryDate after', async () => {
      let order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      order1.deliveryData = { deliveryDate: moment('2019-01-01').toDate() }
      order1 = await orderLBS.createOrder(order1)

      let order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      order2.deliveryData = { deliveryDate: moment('2019-02-01').toDate() }
      order2 = await orderLBS.createOrder(order2)

      return request(app.getHttpServer())
        .get('/orders?deliveryData.deliveryDate.gte=2019-01-15T00:00:00.000')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body[0].id).toEqual(order2.id)
        })
    })

    it('should return error with orders filtered by deliveryData.deliveryDate before', async () => {
      let order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      order1.deliveryData = { deliveryDate: moment('2019-01-01').toDate() }
      order1 = await orderLBS.createOrder(order1)

      let order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      order2.deliveryData = { deliveryDate: moment('2019-02-01').toDate() }
      order2 = await orderLBS.createOrder(order2)

      return request(app.getHttpServer())
        .get('/orders?deliveryData.deliveryDate.lte=2019-01-15T00:00:00.000')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(1)
          expect(response.body[0].id).toEqual(order1.id)
        })
    })

    it('should return orders filtered by deliveryData.deliveryDate between order by deliveryDate desc', async () => {

      let order1: OrderBE = new OrderBE()
      order1.reference = 'CMD.1'
      order1.customer = { id: 5 }
      order1.deliveryData = { deliveryDate: moment('2019-01-01').toDate() }
      order1 = await orderLBS.createOrder(order1)

      let order2: OrderBE = new OrderBE()
      order2.reference = 'CMD.2'
      order2.customer = { id: 3 }
      order2.deliveryData = { deliveryDate: moment('2019-02-01').toDate() }
      order2 = await orderLBS.createOrder(order2)

      let order3: OrderBE = new OrderBE()
      order3.reference = 'CMD.3'
      order3.customer = { id: 3 }
      order3.deliveryData = { deliveryDate: moment('2019-03-01').toDate() }
      order3 = await orderLBS.createOrder(order3)

      let order4: OrderBE = new OrderBE()
      order4.reference = 'CMD.4'
      order4.customer = { id: 5 }
      order4.deliveryData = { deliveryDate: moment('2019-04-01').toDate() }
      order4 = await orderLBS.createOrder(order4)

      if (orderDAO) {
        // none
      }
      return request(app.getHttpServer())
        .get('/orders?deliveryData.deliveryDate.gte=2019-01-15T00:00:00.000&deliveryData.deliveryDate.lte=2019-03-15T00:00:00.000&sort=deliveryData.deliveryDate,desc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toHaveLength(2)
          expect(response.body[0].id).toEqual(order3.id)
          expect(response.body[1].id).toEqual(order2.id)
        })
    })

    it('should return error because of bad filter', async () => {
      return request(app.getHttpServer())
        .get('/orders?badfilter=youhou')
        .expect(500)
        .expect('Content-Type', /json/)
        .then(response => {
          TestUtils.expectErreurReturned(response, { code: 'entity.field.invalid', field: 'badfilter' })
        })
    })
  })

  describe('/:id (GET)', () => {
    it('should return 404 http status code', () => {
      return request(app.getHttpServer())
        .get('/orders/1')
        .expect(404)
        .then(response => {
          TestUtils.expectErreurReturned(response, { field: 'orders', code: 'entity.not.found' })
        })
    })

    it('should return the order', async () => {
      let order = new OrderBE()
      order.reference = 'CMD.1'
      order.orderLines = [
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
      order.customer = {
        id: 54,
        name: 'customer name',
      }
      order = await orderLBS.createOrder(order)

      return request(app.getHttpServer())
        .get('/orders/' + order.id)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toBeDefined()
          expect(response.body.id).toEqual(order.id)
          expect(response.body.reference).toEqual(order.reference)
          expect(response.body.amount).toBeDefined()
          expect(response.body.customer).toBeDefined()
          expect(response.body.customer.id).toEqual(order.customer.id)
          expect(response.body.customer.name).not.toBeDefined()
          expect(response.body.orderLines).toBeDefined()
          expect(response.body.orderLines).toHaveLength(2)
          for (const orderLine of response.body.orderLines) {
            expect(orderLine).toBeDefined()
            expect(orderLine.id).toBeDefined()
            expect(orderLine.quantity).not.toBeDefined()
            expect(orderLine.product).not.toBeDefined()
          }
        })
    })

    // it('should return the order with orderLines.product', async () => {
    //   let order = new CommandBE()
    //   order.id = 1
    //   order.reference = 'CMD.1'
    //   order.lignesCommandes = [
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
    //   order.client = {
    //     id: 54,
    //     isMajeur: true,
    //     prenom: 'firstname',
    //     nom: 'lastname',
    //   }
    //   order = await orderLBS.createOrder(order)
    //
    //   return request(app.getHttpServer())
    //     .get('/orders/' + order.id + '?options=lignesCommandes.produit')
    //     .expect(200)
    //     .expect('Content-Type', /json/)
    //     .then(response => {
    //       expect(response.body).toBeDefined()
    //       expect(response.body.id).toEqual(order.id)
    //       expect(response.body.libelle).toEqual(order.libelle)
    //       expect(response.body.reference).toEqual(order.reference)
    //       expect(response.body.montant).toBeDefined()
    //       expect(response.body.client).toBeDefined()
    //       expect(response.body.client.id).toEqual(order.client.id)
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

    it('should return error because of option not allowed', async () => {
      return request(app.getHttpServer())
        .get('/orders/5?options=unknown')
        .expect(400)
        .expect('Content-Type', /json/)
        .then(response => {
          TestUtils.expectErreurReturned(response, { field: 'options', code: 'option.not.allowed' })
        })
    })

  })

  describe('/ (POST)', () => {
    it('should return error because of empty reference', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({})
        .set('Accept', 'application/json')
        .expect(400)
        .then(response => {
          TestUtils.expectErreurReturned(response, { field: 'reference', code: 'any.required' })
        })
    })

    it('should return new order', () => {
      return request(app.getHttpServer())
        .post('/orders')
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

  describe('/:id (DELETE)', () => {
    it('should return error because of order not found', () => {
      return request(app.getHttpServer())
        .delete('/orders/1')
        .expect(404)
        .then(response => {
          TestUtils.expectErreurReturned(response, { field: 'orders', code: 'entity.not.found' })
        })
    })

    it('should delete the order', async () => {
      let order = new OrderBE()
      order.reference = 'CMD.1'
      order.orderLines = [
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
      order.customer = {
        id: 54,
        name: 'customer name',
      }
      order = await orderLBS.createOrder(order)

      return request(app.getHttpServer())
        .delete('/orders/' + order.id)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(response => {
          expect(response.body).toBeDefined()
          expect(response.body).toEqual({})
          expect(orderLBS.findById(order.id!)).rejects.toBeInstanceOf(EntityNotFoundBusinessException)
        })
    })
  })

})
