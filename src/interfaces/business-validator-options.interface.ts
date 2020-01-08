import { ValidationOptions } from '@hapi/joi'
import { Messages } from './message.interface'

export interface BusinessValidatorOptions {
  messages?: Messages;
  joiOptions?: ValidationOptions
}
