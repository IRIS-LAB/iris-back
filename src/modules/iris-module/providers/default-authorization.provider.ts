import { Injectable } from '@nestjs/common'
import { DefaultAuthorizationService } from '../services'

/**
 * @deprecated use DefaultAuthorizationService instead.
 */
@Injectable()
export class DefaultAuthorizationProvider extends DefaultAuthorizationService {
}
