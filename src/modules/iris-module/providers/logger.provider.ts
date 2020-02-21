import { Injectable } from '@nestjs/common'
import { LoggerService } from '../services'

/**
 * @deprecated use LoggerService instead.
 */
@Injectable()
export class LoggerProvider extends LoggerService {
}
