import fs from 'fs'
import { google } from 'googleapis'

/**
 * Return a helper to get a google token
 * @param secretPath and tokenPath
 * @param logger
 * @param exceptions classes
 */
export const googleAuth = ({ secretPath, tokenPath }, logger, { TokenUnavailableException }) => {
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
      logger.error(`Unable to get google authentification`)
      throw error
    }
  }

  /**
   * Build OAuth Client Object
   * @param {*} param client_secret, client_id and redirect_uris
   */
  async function getOAuthClient({ client_secret, client_id, redirect_uris }) {
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
    // Check if we have previously stored a token.
    try {
      const token = JSON.parse(fs.readFileSync(tokenPath))
      oAuth2Client.setCredentials(token)
      return oAuth2Client
    } catch (err) {
      logger.error(err)
      throw new TokenUnavailableException()
    }
  }
}
