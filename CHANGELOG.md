# CHANGELOG

## Migration from 3.X to 4.X
* remove the dependencies joi and tsdv-joi
* remove RequestContextInterceptor and LoggingInterceptor providers (automatically applied by iris module as middlewares)
* remove usage of middlewares from iris-back (automatically applied by iris module)
* no longer use tsdv-joi to add business validator constraint. Use joiful instead (by importing jf from iris-back)
    * @NestedArray(<type>) => @jf.array({elementClass: <type>})
    * @Nested(<type>) => @jf.object({objectClass: <type>})
* update your DAOs by injectint the loggerProvider and passing it to the 3d argument of IrisDAO
* bootstrap your application by using new bootstrapIrisApp() method (see [README](README.md#application-bootstrap))
* provide an authenticated account with the role ACTUATOR (or another role that you should define in iris module options) to access the new secured actuator endpoints (see [README](README.md#health-checker))

## 4.0.0
* set joi as dependency (there is no need to install it into your application)
* replace tsdv-joi by joiful and upgrade joi version
* rework IrisDAO by using criteriabuilder for database requests
* add security support
* rework actuator health checker (replace terminus by own heath checker)
* add bootstrap utility to bootstrap application
* improve message factory
* rework error provider methods signatures
* fix : logger provider does no longer throw exception if trace id or span id is not available in cls context (this will return '?' in this case)

## 3.1.2
* improve business validator provider by getting error message from message sources of IrisModule
* rework middlewares
* support cors configuration
* actuator health checker now checks typeorm connections
* remove BusinessValidator decorator => use joiful decorators instead
* implements security services
* rework request context and logger
    * deprecates RequestContextInterceptor
    * deprecates LoggingInterceptor
    * add middlewares to create request context and request logging

## 3.1.1
* declare rxjs as peer-dependency

## 3.1.1
* declare rxjs as peer-dependency
 
## 3.1.0
* update dependency @u-iris/iris-common to 3.1.0
* update dependency typeorm to 0.2.19
* send http status 204 only if no @HttpCode is present

## 3.0.3
* @Resource(undefined) will return status code 204 if no content is returned
* fix: rename header Accept-Range => Accept-Ranges
* set- response header Access-Control-Expose-Headers if Access-Control-Allow-Origin is present
* improve unit tests

## 3.0.2
* fix serialization of relation ENTITY in @BodyParam

## 3.0.1
* add method remove to IrisDAO
* implements @BodyParam() for type Array

## 3.0.0
* depends on @u-iris/iris-common@3.0.0

## 2.0.1
* NestJS integration
* TypeORM integration
* implementation of Trace Context

## 2.0.0
* Typescript migration
* Refactorisation

## 1.0.0
* init
