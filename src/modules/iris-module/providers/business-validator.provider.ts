import { Injectable } from '@nestjs/common'
import { Validator as ValidatorService } from '@u-iris/iris-common'

@Injectable()
export class BusinessValidatorProvider extends ValidatorService {

}
