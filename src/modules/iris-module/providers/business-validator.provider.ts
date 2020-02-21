import { Injectable } from '@nestjs/common'
import { BusinessValidatorService } from '../services'

/**
 * @deprecated use BusinessValidatorService instead.
 */
@Injectable()
export class BusinessValidatorProvider extends BusinessValidatorService {
}
