import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.REQUEST })
export class RequestHolder {
  public traceId: string
  public spanId: string
}