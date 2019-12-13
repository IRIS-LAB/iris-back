import helmet from 'helmet'

/**
 * Enable security with cors plugin
 *
 * @deprecated security is already applied in iris module
 */
export const enableSecurity = () => helmet()
