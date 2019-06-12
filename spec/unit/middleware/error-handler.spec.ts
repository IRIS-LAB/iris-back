import {
  BusinessException,
  EntityNotFoundBusinessException,
  ErreurDO,
  SecurityException,
  TechnicalException,
} from '@u-iris/iris-common'
import express from 'express'
import request from 'supertest'
import { Logger, middlewares } from '../../../src'

describe('Middleware error handler', () => {

  it('should catch business exception and return error as JSON', () => {
    const app = express()
    app.use('/', () => {
      throw new BusinessException(new ErreurDO('champ', 'code', 'libelle'))
    })
    app.use(middlewares(Logger.createDefault()).errorHandler)

    return request(app)
      .get('/')
      .expect(400)
      .expect({ erreurs: [{ champErreur: 'champ', codeErreur: 'code', libelleErreur: 'libelle' }] })
  })

  it('should catch entity not found exception and return error as JSON', () => {
    const app = express()
    app.use('/:id', () => {
      throw new EntityNotFoundBusinessException(new ErreurDO('champ', 'code', 'libelle'))
    })
    app.use(middlewares(Logger.createDefault()).errorHandler)

    return request(app)
      .get('/45')
      .expect(404)
      .expect({ erreurs: [{ champErreur: 'champ', codeErreur: 'code', libelleErreur: 'libelle' }] })
  })

  it('should catch technical exception and return error as JSON', () => {
    const app = express()
    app.use('/', () => {
      throw new TechnicalException(new ErreurDO('champ', 'code', 'libelle'), new Error())
    })
    app.use(middlewares(Logger.createDefault()).errorHandler)

    return request(app)
      .get('/')
      .expect(500)
      .expect({ erreurs: [{ champErreur: 'champ', codeErreur: 'code', libelleErreur: 'libelle' }] })
  })

  it('should catch security exception, return error as JSON and HTTP status 401', () => {
    const app = express()
    app.use('/', () => {
      throw new SecurityException(new ErreurDO('champ', 'security.authentication', 'libelle'))
    })
    app.use(middlewares(Logger.createDefault()).errorHandler)

    return request(app)
      .get('/')
      .expect(401)
      .expect({ erreurs: [{ champErreur: 'champ', codeErreur: 'security.authentication', libelleErreur: 'libelle' }] })
  })

  it('should catch security exception, return error as JSON and HTTP status 403', () => {
    const app = express()
    app.use('/', () => {
      throw new SecurityException(new ErreurDO('champ', 'access.forbidden', 'libelle'))
    })
    app.use(middlewares(Logger.createDefault()).errorHandler)

    return request(app)
      .get('/')
      .expect(403)
      .expect({ erreurs: [{ champErreur: 'champ', codeErreur: 'access.forbidden', libelleErreur: 'libelle' }] })
  })

})
