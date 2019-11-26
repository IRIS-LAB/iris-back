import bodyParser from 'body-parser'

/**
 * Transform body request to a JSON object
 */
export const parseJSON = () => bodyParser.json()
