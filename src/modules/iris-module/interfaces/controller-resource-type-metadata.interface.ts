export interface ControllerResourceTypeMetadata<T> {
  type: new(...args) => T
  resource: string
}
