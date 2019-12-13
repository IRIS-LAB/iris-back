import bodyParser from 'body-parser'

/**
 * Transform body request to a JSON object
 * @deprecated json is already applied in nestjs module
 */
export const parseJSON = () => bodyParser.json()
