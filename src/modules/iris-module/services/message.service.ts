import { Inject, Injectable } from '@nestjs/common'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { MessageFactory } from '../commons'
import { IrisConfigOptions } from '../../config-module/config-holder'

export let messageSource: MessageService

@Injectable()
export class MessageService {
  private messageFactory: MessageFactory

  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {
    this.messageFactory = new MessageFactory({ resources: this.irisConfigOptions.messagesSources })
    messageSource = this
  }

  public has(key: string): boolean {
    return this.messageFactory.has(key)
  }

  public get(key: string, datas?: object): string {
    return this.messageFactory.get(key, datas) || `missing key ${key} in properties`
  }

}
