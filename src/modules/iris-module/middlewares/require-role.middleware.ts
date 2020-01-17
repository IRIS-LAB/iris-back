import { NestMiddleware, Type } from '@nestjs/common'
import { SECURED_METADATAS } from '../../../constants'

export function RequireRole(...functions: string[]): Type<NestMiddleware> {
  return class implements NestMiddleware {
    public use(request: any, res: any, next: () => void): any {
      if (!request[SECURED_METADATAS]) {
        request[SECURED_METADATAS] = []
      }
      request[SECURED_METADATAS].push(...functions)
      next()
    }
  }
}