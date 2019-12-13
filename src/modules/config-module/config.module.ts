import { DynamicModule, Module } from '@nestjs/common'
import { IRIS_CONFIG_OPTIONS } from '../../constants'
import { getIrisConfigOptions, IrisConfigOptions } from './config-holder'

@Module({})
export class ConfigModule {
  public static forRoot(options: IrisConfigOptions): DynamicModule {

    const irisConfigOptions = getIrisConfigOptions(options)

    return {
      module: ConfigModule,
      providers: [
        {
          provide: IRIS_CONFIG_OPTIONS,
          useValue: irisConfigOptions,
        },
      ],
      exports: [
        {
          provide: IRIS_CONFIG_OPTIONS,
          useExisting: true,
        },
      ],
    }
  }
}