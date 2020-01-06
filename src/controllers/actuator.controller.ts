import { Get, Inject } from '@nestjs/common'
import fs from 'fs'
import moment from 'moment'
import { getConnectionManager } from 'typeorm'
import properties from 'utils-fs-read-properties'
import { IRIS_CONFIG_OPTIONS } from '../constants'
import { IrisActuatorConfigOptions, IrisConfigOptions } from '../modules/config-module'

export class ActuatorController {

  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {

  }

  private static getBuild() {
    let packageJson
    try {
      const packageFile = fs.readFileSync('./package.json', 'utf8')
      packageJson = JSON.parse(packageFile)
    } catch (err) {
      // Error getting and parsing package.json
    }

    let build
    if (packageJson !== undefined) {
      build = {
        name: packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
      }
    }

    return build
  }

  private static getGit(infoGitMode: IrisActuatorConfigOptions['gitMode']) {
    let git

    const data = properties.sync('git.properties')
    if (!(data instanceof Error)) {
      if (infoGitMode === 'simple') {
        git = {
          branch: data['git.branch'],
          commit: {
            id: data['git.commit.id.abbrev'],
            time: moment(data['git.commit.time'], moment.ISO_8601).valueOf(),
          },
        }
      } else if (infoGitMode === 'full') {
        git = {
          branch: data['git.branch'],
          commit: {
            id: data['git.commit.id.abbrev'],
            idFull: data['git.commit.id'],
            time: moment(data['git.commit.time'], moment.ISO_8601).valueOf(),
            user: {
              email: data['git.commit.user.email'],
              name: data['git.commit.user.name'],
            },
            message: {
              full: data['git.commit.message.full'],
              short: data['git.commit.message.short'],
            },
          },
        }
      }
    }

    return git
  }

  @Get('/health')
  public health() {
    let up: boolean = true

    if (this.irisConfigOptions.actuatorOptions!.enableTypeOrm) {
      try {
        const connections = getConnectionManager().connections
        up = up && connections.reduce((isConnected: boolean, connec) => isConnected && connec.isConnected, true)
      } catch (e) {
        // nothing
      }
    }

    return { status: up ? 'UP' : 'DOWN' }
  }

  @Get('/info')
  public info() {
    const build = ActuatorController.getBuild()
    const git = ActuatorController.getGit(this.irisConfigOptions.actuatorOptions!.gitMode)

    return {
      build,
      git,
    }
  }

  @Get('/metrics')
  public metrics() {
    return {
      mem: process.memoryUsage(),
      uptime: process.uptime(),
    }
  }

  @Get('/env')
  public env() {
    return {
      propertySources: [
        {
          name: 'systemProperties',
          properties: Object.keys(process.env).map(key => ({ [key]: { value: process.env[key] } })),
        },
      ],
    }
  }
}