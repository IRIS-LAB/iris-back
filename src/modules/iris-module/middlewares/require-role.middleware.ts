import { NestMiddleware, Type } from '@nestjs/common'
import { ROLES_METADATAS } from '../../../constants'

export function RequireRole(...functions: string[]): Type<NestMiddleware> {
  return class implements NestMiddleware {
    public use(request: any, res: any, next: () => void): any {
      if (!request[ROLES_METADATAS]) {
        request[ROLES_METADATAS] = []
      }
      request[ROLES_METADATAS].push(...functions)
      next()
    }
  }
}