import { ValidationOptions } from '@hapi/joi'
import { Injectable } from '@nestjs/common'
import { BusinessException, ErrorDO } from '@u-iris/iris-common'
import * as jf from 'joiful'
import { Messages } from '../../../interfaces'
import { MessageService } from './message.service'

@Injectable()
export class BusinessValidatorService {
  constructor(private readonly messageService: MessageService) {
  }

  /**
   * Validate a bean decorated with joi decorators. If an error occurs, BusinessException with errors field will be thrown.
   * @param object - object to validate
   * @param options - validator options with messages and/or joiOptions overridden.
   */
  public validate<T>(object: T, joiOptions?: ValidationOptions): T {
    return this.validateJoiResult(
      jf.validate(object, {
        allowUnknown: true,
        skipFunctions: true,
        stripUnknown: false,
        ...(joiOptions ? joiOptions : {}),
        abortEarly: false,
      }))
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
      .find(k => this.messageService.has(k))
    if (key) {
      return this.messageService.get(key, context)
    }
    return this.getMessage(field, code, context, undefined, message, messages)
  }

  /**
   * Check the validation result and throw a BusinessException with field errors if the validation fails.
   * @param result - the validation result object
   * @param messages - the messages object
   */
  private validateJoiResult<T>(result: jf.ValidationResult<T>, messages?: Messages | null): T {
    if (result.error) {
      const errors = result.error.details.map(({ message, context, type, path }) => {
        if (!context || !context.key) {
          return
        }
        const field = context.key
        context.field = context.key
        const constructor = result.value ? (result.value as any).constructor : undefined
        context.parentType = constructor && constructor.name ? constructor.name.toLowerCase() : 'unknown'

        return new ErrorDO(field, type, this.getMessage(field, type, context, constructor, message, messages), {
          value: context.value,
          limit: context.limit,
          path: (path as unknown) as Array<string | number>,
        })
      }).filter(e => e !== undefined && e !== null) as ErrorDO[]
      throw new BusinessException(errors)
    }
    return result.value
  }
}
