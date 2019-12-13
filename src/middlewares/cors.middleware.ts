import cors, { CorsOptions } from 'cors'

/**
 * Enable cors with cors plugin
 *
 * @deprecated cors enabling is already provided by iris module
 */
export const enableCors = (corsOptions?: CorsOptions) => {
  return cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Element', 'X-Total-Page', 'X-Page-Element-Count', 'Accept-Ranges', 'Content-Range', 'Link'],
    ...corsOptions,
  })
}
