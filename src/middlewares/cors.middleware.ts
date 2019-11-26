import cors, { CorsOptions } from 'cors'

/**
 * Enable cors with cors plugin
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
