import { Injectable } from '@nestjs/common'
import { Messages } from '../../../interfaces'
import { BusinessValidatorService } from '../../../services'
import { MessageProvider } from './message.provider'

@Injectable()
export class BusinessValidatorProvider extends BusinessValidatorService {
  constructor(private readonly messageProvider: MessageProvider) {
    super()
  }

  protected getMessage(field: string, code: string, context: any, parentType: typeof Object.constructor | undefined, message: string, messages?: Messages | null): string {
    const labelKeys: Array<Array<string | undefined>> = [
      ['error', parentType && parentType.name ? parentType.name.toLocaleLowerCase() : undefined, field, code, 'label'],
      ['error', parentType && parentType.name ? parentType.name.toLocaleLowerCase() : undefined, field, code],
      ['error', field, code, 'label'],
      ['error', field, code],
      ['error', code, 'label'],
      ['error', code],
    ]
    const key = labelKeys
      .map(keys => keys.filter(k => k !== undefined).join('.'))
      .find(k => this.messageProvider.has(k))
    if (key) {
      return this.messageProvider.get(key, context)
    }
    return super.getMessage(field, code, context, undefined, message, messages)
  }
}
