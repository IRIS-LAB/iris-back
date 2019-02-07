import eActuator from 'express-actuator'

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
    // actuator
    app.get('/actuator/health', health)
    app.use(eActuator('/actuator'))
  }

  /**
   * health route
   * @param {*} req request
   * @param {*} res response
   */
  async function health(req, res) {
    try {
      res.json({ status: 'UP' })
    } catch (error) {
      logger.error('An error occured', error)
      res.status(500).send('An error occured')
    }
  }
}
