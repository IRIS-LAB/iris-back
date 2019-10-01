# CHANGELOG

## 3.0.3+
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
