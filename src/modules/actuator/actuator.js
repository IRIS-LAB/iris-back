import eActuator from 'express-actuator'
import { TechnicalException, ErreurDO } from '@u-iris/iris-common'

/**
 * @param {*} logger winston logger object
 * @returns function to use actuator
 */
export const actuator = logger => {
  return { route }

  /**
   * Add actuator for the App express
   * @param {App} app express
   */
  async function route(app) {
    try {
      // actuator
      app.get('/actuator/health', health)
      app.use(eActuator('/actuator'))
    } catch (error) {
      logger.error(error)
      const errorDo = new ErreurDO(null, 'error.actuator.init', 'Unable to init Actuator')
      throw new TechnicalException(errorDo)
    }
  }

  /**
   * health route
   * @param {*} req request
   * @param {*} res response
   */
  async function health(req, res) {
    res.json({ status: 'UP' })
  }
}
