import { BusinessException, ErrorDO } from '@u-iris/iris-common'
import deepmerge from 'deepmerge'
import * as jf from 'joiful'
import { BusinessValidatorOptions, Messages } from '../../interfaces'

/**
 * BusinessValidatorService used to validate a bean with joiful decorators (https://github.com/joiful-ts/joiful).
 */
export class BusinessValidatorService {

  private options?: BusinessValidatorOptions

  /**
   * Constructor
   * @param options- validator options with messages and/or joiOptions overridden.
   */
  constructor(options?: BusinessValidatorOptions) {
    this.options = options
  }

  /**
   * Validate a bean decorated with joi decorators. If an error occurs, BusinessException with errors field will be thrown.
   * @param object - object to validate
   * @param options - validator options with messages and/or joiOptions overridden.
   */
  public validate<T>(object: T, options ?: BusinessValidatorOptions): T {
    return this.validateJoiResult(
      jf.validate(object, {
        allowUnknown: true,
        skipFunctions: true,
        stripUnknown: false,
        ...(this.options && this.options.joiOptions ? this.options.joiOptions : {}),
        abortEarly: false,
      }), deepmerge(this.options ? this.options : {}, options || {}).messages)
  }

  /**
   * Return a message by a code.
   * @param field - the field that will replace the keyword '$ field' in the message
   * @param code - the error code
   * @param context - the joi validation context of the error
   * @param parentType - type of object container field
   * @param message - the default message if no message in found in messages
   * @param messages?? - the set of messages
   */
  protected getMessage(field: string, code: string, context: any, parentType: typeof Object.constructor | undefined, message: string, messages?: Messages | null): string {
    if (messages) {
      let found = false
      const splittedType = code.split('.')
      let data: any = messages
      for (const part of splittedType) {
        if (data.hasOwnProperty(part)) {
          data = data[part]
          if (typeof data === 'string') {
            found = true
            break
          }
        } else {
          break
        }
      }
      if (found && data) {
        let result = data.toString()
        for (const key in context) {
          if (context.hasOwnProperty(key)) {
            result = result.replace('$' + key, context[key])
          }
        }
        return result
      }
    }
    return message
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
