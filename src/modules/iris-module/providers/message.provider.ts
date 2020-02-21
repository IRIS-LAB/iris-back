import { Injectable } from '@nestjs/common'
import { MessageService } from '../services'

/**
 * @deprecated use MessageService instead.
 */
@Injectable()
export class MessageProvider extends MessageService {

}
