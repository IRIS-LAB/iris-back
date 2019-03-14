import fs from 'fs'
import { google } from 'googleapis'
import { TechnicalException, ErreurDO } from '@u-iris/iris-common'
<<<<<<< HEAD
=======
import { OAuth2Client } from 'googleapis-common'
>>>>>>> fix @ugieiris -> @u-iris

/**
 * Return a helper to get a google token
 * @param {Object} secretPath and tokenPath
 * @param {Object} logger
 * @name googleAuth
 */
export const googleAuth = ({ secretPath, tokenPath }, logger) => {
  return {
    getGoogleAuthClient: getGoogleAuthClient,
  }

  /**
   * Return a google auth token
   * @returns {OAuth2Client}
   */
  async function getGoogleAuthClient() {
    try {
      // load secret file
      const fileSecret = JSON.parse(fs.readFileSync(secretPath))
      // get oAuth2Client
      return await getOAuthClient(fileSecret.installed)
    } catch (error) {
      logger.error(error)
      const errorDo = new ErreurDO(
        null,
        'error.google.authentification',
        'Unable to get google authentification',
      )
      throw new TechnicalException(errorDo)
    }
  }

  /**
   * Build OAuth Client Object
   * @param {*} param client_secret, client_id and redirect_uris
   */
  async function getOAuthClient({ client_secret, client_id, redirect_uris }) {
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
    const token = JSON.parse(fs.readFileSync(tokenPath))
    oAuth2Client.setCredentials(token)
    return oAuth2Client
  }
}
