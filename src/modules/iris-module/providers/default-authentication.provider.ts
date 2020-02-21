import { Injectable } from '@nestjs/common'
import { DefaultAuthenticationService } from '../services'

/**
 * @deprecated use DefaultAuthenticationService instead.
 */
@Injectable()
export class DefaultAuthenticationProvider extends DefaultAuthenticationService {
}
