# CHANGELOG

## Migration from 3.1 to 4.0
* remove RequestContextInterceptor and LoggingInterceptor providers (automatically applied by iris module as middlewares)
* remove usage of middlewares from iris-back (automatically applied by iris module)
* no longer use tsdv-joi to add business validator constraint. Use joiful instead (by importing jf from iris-back)
    * @NestedArray(<type>) => @jf.array({elementClass: <type>})
    * @Nested(<type>) => @jf.object({objectClass: <type>})
## 4.0.0
* set nestjs, joi and typeorm as dependencies (theses dependencies are now automatically imported by iris-back)
* replace tsdv-joi by joiful and upgrade joi version
* rework IrisDAO by using criteriabuilder for database requests

## 3.1.2-SNAPSHOT
* improve business validator provider by getting error message from message sources of IrisModule
* rework middlewares
* support cors configuration
* actuator health checker now checks typeorm connections
* remove BusinessValidator decorator => use joiful decorators instead

## 3.1.2-SNAPSHOT
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
