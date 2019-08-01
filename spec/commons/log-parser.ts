import fs from 'fs'
import readline from 'linebyline'
import moment from 'moment'

interface RequestLog {
  method: string,
  uri: string,
  ip: string
  queryParams?: any
}

export interface LogLine {
  date?: Date
  thread?: number,
  appName?: string,
  appVersion?: string,
  traceId?: string
  spanId?: string
  exportZipkin?: boolean
  level?: string
  message?: string
  request?: RequestLog
}

export class LogParser {
  private static DATE_REGEX = /([\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}[+|-][\d]{2}:[\d]{2})/
  private static THREAD_REGEX = /thread([\d]+)/
  private static APPNAME_REGEX = /([\w-_]+)/
  private static VERSION_REGEX = /([\d]+\.[\d]+\.[\d]+(?:-[\d]+)?)/
  private static TRACE_ID_REGEX = /([\w\W]+)/
  private static SPAN_ID_REGEX = /([\w\W]+)/
  private static EXPORT_ZIPKIN_REGEX = /(false|true)/
  private static LEVEL_REGEX = /(DEBUG|INFO|WARN|ERROR)/
  private static MESSAGE_REGEX = /([\w\W]*)/

  private static LINE_REGEX = new RegExp(`^${LogParser.DATE_REGEX.source} \\[${LogParser.THREAD_REGEX.source}] \\[${LogParser.APPNAME_REGEX.source}-${LogParser.VERSION_REGEX.source},${LogParser.TRACE_ID_REGEX.source},${LogParser.SPAN_ID_REGEX.source},${LogParser.EXPORT_ZIPKIN_REGEX.source}] ${LogParser.LEVEL_REGEX.source} ${LogParser.MESSAGE_REGEX.source}$`)

  private static QUERY_PARAM_REGEX = /"([\w\W]+)":"([\w\W]*)"/
  private static REQUEST_MESSAGE_REGEX = new RegExp(`^verb=([A-Z]+),uri=([\\w\\W]+),queryParams={(${LogParser.QUERY_PARAM_REGEX.source})?(?:,${LogParser.QUERY_PARAM_REGEX.source})*},ip=([\\w\\W]+)$`)

  // private static TEMP = /^verb=([A-Z]+),uri=([\w\W]+),queryParams={("([\w\W]+)":"([\w\W]*)")?(?:,"([\w\W]+)":"([\w\W]*)")*},ip=([\w\W]+)$/
  public lines: string[] = []

  public parsedLines: LogLine[] = []

  public constructor(private readonly filepath: string) {
  }

  public async read(): Promise<LogParser> {
    // tslint:disable-next-line:no-this-assignment
    const that = this
    return new Promise((resolve, reject) => {
      readline(fs.createReadStream(this.filepath))
        .on('line', this.readLine.bind(that))
        .on('end', () => {
          resolve(that)
        })
        .on('error', reject)
    })

  }

  private readLine(line) {
    this.lines.push(line)
    if (line.match(LogParser.LINE_REGEX)) {
      const matchingGroups = LogParser.LINE_REGEX.exec(line)
      if (matchingGroups) {

        const parsedLine: LogLine = {
          date: moment(matchingGroups[1] as string).toDate(),
          thread: parseInt(matchingGroups[2]),
          appName: matchingGroups[3],
          appVersion: matchingGroups[4],
          traceId: matchingGroups[5],
          spanId: matchingGroups[6],
          exportZipkin: matchingGroups[7] === 'true',
          level: matchingGroups[8],
          message: matchingGroups[9]
        }
        parsedLine.request = this.parseMessageAsRequest(parsedLine.message)
        this.parsedLines.push(parsedLine)
      }
    }
  }

  private parseMessageAsRequest(message?: string): RequestLog | undefined {
    let requestLog: RequestLog | undefined
    if (message && message.match(LogParser.REQUEST_MESSAGE_REGEX)) {
      const matchingGroups = LogParser.REQUEST_MESSAGE_REGEX.exec(message)
      if (matchingGroups) {
        requestLog = {
          method: matchingGroups[1],
          uri: matchingGroups[2],
          ip: matchingGroups[matchingGroups.length - 1],
        }
        if (matchingGroups[3]) {
          try {
            requestLog.queryParams = JSON.parse(`{${matchingGroups[3]}}`)
          } catch (e) {
            // tslint:disable-next-line:no-console
            console.warn(e)
          }
        }
      }
    }
    return requestLog
  }
}
