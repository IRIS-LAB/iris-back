import { Inject, Injectable } from '@nestjs/common'
import cls from 'cls-hooked'
import { EventEmitter } from 'events'
import uuid from 'uuid'
import { IRIS_CONFIG_OPTIONS } from '../../../constants'
import { IrisConfigOptions } from '../../config-module'
import { AuthenticatedUser } from '../interfaces'

@Injectable()
export class ClsService implements cls.Namespace {


  private static TRACE_ID = 'trace-id'
  private static SPAN_ID = 'span-id'
  private static AUTHORIZATION_TOKEN = 'authorization-token'
  private static AUTHENTICATED_USER = 'authenticated-user'

  private cls: cls.Namespace

  private readonly namespace?: string

  constructor(@Inject(IRIS_CONFIG_OPTIONS) private irisConfigOptions: IrisConfigOptions) {
    this.namespace = this.irisConfigOptions && this.irisConfigOptions.logger && this.irisConfigOptions.logger.appName ? this.irisConfigOptions.logger.appName : `namespace${uuid.v4()}`
    this.cls = cls.createNamespace(this.namespace)
  }

  get active() {
    return this.cls.active
  }

  public get(key: string) {
    return this.cls.get(key)
  }

  public set<T>(key: string, value: T): T {
    return this.cls.set(key, value)
  }

  public getTraceId() {
    return this.get(ClsService.TRACE_ID)
  }

  public setTraceId(traceId: string) {
    return this.set(ClsService.TRACE_ID, traceId)
  }

  public getSpanId() {
    return this.get(ClsService.SPAN_ID)
  }

  public setSpanId(spanId: string) {
    return this.set(ClsService.SPAN_ID, spanId)
  }

  public getAuthorizationToken() {
    return this.get(ClsService.AUTHORIZATION_TOKEN)
  }

  public setAuthorizationToken(token: string) {
    return this.set(ClsService.AUTHORIZATION_TOKEN, token)
  }

  public getAuthenticatedUser() {
    return this.get(ClsService.AUTHENTICATED_USER)
  }

  public setAuthenticatedUser(user?: AuthenticatedUser) {
    return this.set(ClsService.AUTHENTICATED_USER, user)
  }

  public run(cb: (...args: any[]) => void) {
    this.cls.run(cb)
  }

  public bindEmitter(emitter: EventEmitter) {
    this.cls.bindEmitter(emitter)
  }

  public runAndReturn<T>(fn: (...args: any[]) => T): T {
    return this.cls.runAndReturn(fn)
  }

  public runPromise<T>(fn: (...args: any[]) => Promise<T>): Promise<T> {
    return this.cls.runPromise(fn)
  }

  // tslint:disable-next-line:ban-types
  public bind<F extends Function>(fn: F, context?: any): F {
    return this.cls.bind(fn, context)
  }

  public createContext() {
    return this.cls.createContext()
  }

  public enter(context: any): void {
    return this.cls.enter(context)
  }

  public exit(context: any): void {
    return this.cls.exit(context)
  }
}
