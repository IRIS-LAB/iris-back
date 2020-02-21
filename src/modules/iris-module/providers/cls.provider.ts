import { Injectable } from '@nestjs/common'
import { ClsService } from '../services'

/**
 * @deprecated Use ClsService instead.
 */
@Injectable()
export class ClsProvider extends ClsService {

}
