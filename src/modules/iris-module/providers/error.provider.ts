import { Injectable } from '@nestjs/common'
import { ErrorService } from '../services'

/**
 * @deprecated use ErrorService instead.
 */
@Injectable()
export class ErrorProvider extends ErrorService {

}
