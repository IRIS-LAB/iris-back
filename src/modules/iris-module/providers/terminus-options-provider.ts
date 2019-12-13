import { Inject, Injectable } from '@nestjs/common'
import {
  DiskHealthIndicator,
  DNSHealthIndicator,
  HealthIndicatorFunction,
  MemoryHealthIndicator,
  TerminusModuleOptions,
  TerminusOptionsFactory,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus'
import { getConnectionManager } from 'typeorm'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { IrisConfigOptions } from '../../config-module'

@Injectable()
export class TerminusOptionsProvider implements TerminusOptionsFactory {
  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions, private readonly dns: DNSHealthIndicator, private readonly typeorm: TypeOrmHealthIndicator, private readonly memory: MemoryHealthIndicator, private readonly disk: DiskHealthIndicator) {
  }

  public async createTerminusOptions(): Promise<TerminusModuleOptions> {

    const healthIndicators: HealthIndicatorFunction[] = []
    if (this.irisConfigOptions.actuatorOptions!.enablePing) {
      healthIndicators.push(async () => this.dns.pingCheck('dns.ping', this.irisConfigOptions.actuatorOptions!.pingUri!))
    }
    if (this.irisConfigOptions.actuatorOptions!.enableTypeOrm) {
      try {
        const connections = getConnectionManager().connections
        // @ts-ignore
        connections.forEach(connection => healthIndicators.push(async () => this.typeorm.pingCheck('database.' + connection.name, {
          timeout: 1500,
          connection,
        })))
      } catch (e) {
        // nothing
      }
    }
    if (this.irisConfigOptions.actuatorOptions!.enableMemoryHeapThreshold) {
      healthIndicators.push(async () => this.memory.checkHeap('memory.heap.max', this.irisConfigOptions.actuatorOptions!.memoryHeapUsedThreshold! * 1024 * 1024))
    }
    if (this.irisConfigOptions.actuatorOptions!.enableDiskStorageThreshold) {
      healthIndicators.push(async () => this.disk.checkStorage('disk.storage.max', this.irisConfigOptions.actuatorOptions!.diskStorageThresholdOptions!))
    }
    return {
      endpoints: [{
        url: this.irisConfigOptions.actuatorOptions!.endpoint!,
        healthIndicators,
      }],
    }
  }

}
