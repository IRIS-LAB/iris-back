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
   * @param {defaultRoute} route to access to actuator , '/actuator' by default
   */
  async function route(app, defaultRoute = '/actuator') {
    try {
      // actuator
      app.get(`${defaultRoute}/health`, health)
      app.use(eActuator(defaultRoute))
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
