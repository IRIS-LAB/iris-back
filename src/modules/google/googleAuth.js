import fs from 'fs'
import { google } from 'googleapis'
import { TechnicalException, ErrorDO } from '@ugieiris/iris-common'

/**
 * Return a helper to get a google token
 * @param secretPath and tokenPath
 * @param logger
 * @param exceptions classes
 */
export const googleAuth = ({ secretPath, tokenPath }, logger) => {
  return {
    getGoogleAuthClient
  }

  /**
   * Return a google auth token
   */
  async function getGoogleAuthClient() {
    try {
      // load secret file
      const fileSecret = JSON.parse(fs.readFileSync(secretPath))
      // get oAuth2Client
      return await getOAuthClient(fileSecret.installed)
    } catch (error) {
      logger.error(error)
      const errorDo = new ErrorDO(
        null,
        'error.google.authentification',
        'Unable to get google authentification'
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
