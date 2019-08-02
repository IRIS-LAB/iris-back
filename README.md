# iris-back
iris-back is a set of tools for Typescript backend project, based on the powerfull frameworks like [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/#/) and [Joi](https://github.com/hapijs/joi). 

The main features are :
* HTTP web services exposition with type serialization (**S**earch with pagination, **C**reate, **R**ead, **U**pdate, **D**elete)
* ORM for relational databases
* Relations and options manager from entities to filter HTTP requests and responses
* Business entities validator
* Trace Context support
* Logger
* Messages provider from .properties files

## Installation

```bash
$ npm install @u-iris/iris-back --save
```

## Usage

### Before
Please note that iris-back is built top of [NestJS](https://nestjs.com/) and [TypeORM](https://typeorm.io/#/). 

Before starting to use iris-back, you should read official documentation of theses frameworks. 

### Application bootstrap
TBD

### Application context
TBD

### Business Entity
A business entity is an object related to a database and/or a resource exposed by a controller.

#### Database link
Define a business entity related to a database with TypeORM decorators.

Example:
```typescript
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity(`COMMANDE`)
export class CommandBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'REFERENCE', length: 10 })
  public reference: string

  @Column({ name: 'MONTANT', nullable: true, type: 'float' })
  public amount?: number

  @Column({ name: 'STATE', nullable: false })
  public state?: CommandStateEnum

  @OneToMany(type => CommandLineBE, commandLines => commandLines.command, {
    eager: false,
    cascade: true,
  })
  public commandLines: CommandLineBE[]

  @ManyToOne(type => AddressBE, {
    eager: true,
    cascade: true,
  })
  public billingAddress: AddressBE

  // Part of business entity : all fields of BEP will be saved into the business entity. 
  // BEP is used for a logical organization of your model
  @Column(type => DeliveryDatasBEP, {
    prefix: '', // for embedded BEP, set typeorm prefix to ''
  })
  public deliveryDatas?: DeliveryDatasBEP

  // External business entity : content of XBE is not saved in your database. You just need its ID.
  // XBE generally provides from external API.
  @Column(type => CustomerXBE, {
    prefix: '', // for embedded XBE entity from externe API, set typeorm prefix to ''
  })
  public customer: CustomerXBE
}
```
#### Relations and allowed options
**Relations** are used to define how your entity will be serialized from HTTP request and to HTTP response. A relation can be type of :
* NONE : relation is removed from HTTP request and to HTTP response
* ASSOCIATION : only ID of the related entity is kept from HTTP request and to HTTP response
* ENTITY : all of the related entity is kept

Decorate your relations with `@Relation(<relation-entity-type>[, <type>])` with:
* `relation-entity-type`: one of RelationEntity.ASSOCIATION, RelationEntity.ENTITY, RelationEntity.NONE
* `type`: type of array if your relation is a OneToMany or ManyToMany (type is required for an array because typescript does not provides a way to automatically detect a parameterized type)

**Options** allow the consumer of your API to retrieve the content of the relations marked as ASSOCIATION or NONE.

Decorate your business entity class with `@AllowedOptions(...<relation_path>)` with:
* `relation_path`: list of the business entity relations you want to allow as options. You can define a child entity like `field.field_of_child` (in this case, all content of the field and the field_of_child will be returned)

Please note that when relations are defined as ASSOCIATION or when options are enabled by API consumer, content of the relation is filled until the exposition interceptor is called to hide part of it.

Example:
```typescript
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AllowedOptions, Relation, RelationEntity } from '@u-iris/iris-back'

@Entity(`COMMANDE`)
@AllowedOptions('commandLines', 'commandLines.product', 'customer')
export class CommandBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'REFERENCE', length: 10 })
  public reference: string

  @Column({ name: 'MONTANT', nullable: true, type: 'float' })
  public amount?: number

  @Column({ name: 'STATE', nullable: false })
  public state?: CommandStateEnum

  // @Relation() applied to a field typeof Array must declare the type of array in parameter. This is a technical constraint of typescript
  @Relation(RelationEntity.ASSOCIATION, CommandLineBE)
  @OneToMany(type => CommandLineBE, commandLines => commandLines.command, {
    eager: false,
    cascade: true,
  })
  public commandLines: CommandLineBE[]

  // When applied to an object type, typeof field is not required
  @Relation(RelationEntity.ENTITY)
  @ManyToOne(type => AddressBE, {
    eager: true,
    cascade: true,
  })
  public billingAddress: AddressBE

  @Column(type => DeliveryDatasBEP, {
    prefix: '',
  })
  public deliveryDatas?: DeliveryDatasBEP

  @Relation(RelationEntity.ASSOCIATION)
  @Column(type => CustomerXBE, {
    prefix: '',
  })
  public customer: CustomerXBE
}
```

#### Business validator
Business validation rules are required to serialize HTTP request. If no @Relation and no @BusinessValidator is defined on a business entity field, field from HTTP request will be ignore.
Moreover business validator is used to define constraint validator.

Example:
```typescript
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AllowedOptions, Relation, RelationEntity, BusinessValidator } from '@u-iris/iris-back'
import { Joi } from 'tsdv-joi/core'

@Entity(`COMMANDE`)
@AllowedOptions('commandLines', 'commandLines.product', 'customer')
export class CommandBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'REFERENCE', length: 10 })
  @BusinessValidator(Joi.string().required())
  public reference: string

  @Column({ name: 'MONTANT', nullable: true, type: 'float' })
  @BusinessValidator(Joi.number())
  public amount?: number

  @Column({ name: 'STATE', nullable: false })
  // Constraint for enum
  @BusinessValidator(Joi.string().equal(Object.keys(CommandStateEnum).map(k => CommandStateEnum[k])))
  public state?: CommandStateEnum

  @Relation(RelationEntity.ASSOCIATION, CommandLineBE)
  @OneToMany(type => CommandLineBE, commandLines => commandLines.command, {
    eager: false,
    cascade: true,
  })
  public commandLines: CommandLineBE[]

  @Relation(RelationEntity.ENTITY)
  @ManyToOne(type => AddressBE, {
    eager: true,
    cascade: true,
  })
  public billingAddress: AddressBE

  @Column(type => DeliveryDatasBEP, {
    prefix: '',
  })
  public deliveryDatas?: DeliveryDatasBEP

  @Relation(RelationEntity.ASSOCIATION)
  @Column(type => CustomerXBE, {
    prefix: '',
  })
  public customer: CustomerXBE
}
```

You can validate an entity with the injectable provider `BusinessValidatorProvider`  

Example:
```typescript
import { Injectable } from '@nestjs/common'

@Injectable()
export class CommandLBS {

  constructor(private readonly businessValidatorProvider: BusinessValidatorProvider) {
  }

  public async validateCommande(command: CommandBE): Promise<CommandBE> {
    return this.businessValidatorProvider.validate(command) // if a constraint is not validated, a BusinessException will be thrown
  }
}

```
### Exposition Business Service (Controller)

Exposition Business Service is used as NestJS Controller. It provides some features :
* serialization (request and response)
* interceptors for relations and options
* interceptors for pagination response (with pagination datas in headers)

First define your routes of EBS with default decorators from NestJS (@Controller, @Get, @Post, @Put, @Delete).

Then you can apply resources interceptors (as NestJS interceptors) to manage the serialization and pagination of your business entities :

* `@PaginatedResources(<entity_type>, <resource__name>, <default_page_size>, <max_page_size>)` for search api with pagination:
    * `entity_type`: Type of your business entity
    * `resource__name`: name of the resource (used to generate response headers)
    * `default_page_size`: Page size per default (if query parameter 'page' is not set)
    * `max_page_size`: Page max size (query parameter 'size' should not exceed this)
    
The method on which this decorator is applied must return a `Promise<PaginatedListResult<T>>` where T is the type of the entity you passed in `@PaginatedResources()`

* `@Resource(<entity_type>)` for api that return an entity object :
    * `entity_type`: Type of your business entity
    
The method on which this decorator is applied must return a `Promise<T>` where T is the type of the entity you passed in `@Resource()`

To retrieve parameters from the HTTP request, use this parameter decorators :

For **Query parameter**, use `@QueryParam(<datas>)` with :
- `datas`: name of the parameter or an object like { key: 'name of the parameter', required: boolean } 
in some cases, datas could contain other parameters.

If you want to cast the query parameter into a specific type :
* `@DateQueryParam(<parameter_name>)` for a date (parameter must be in ISO format)
* `@EnumQueryParam({type: <type_of_enum>, key: <parameter_name>})` for an enum
* `@NumberQueryParam(<parameter_name>)` for a number
* `@StringQueryParam(<parameter_name>)` for a string

For **Path parameter**, use @PathParam(<parameter_name>)

If you want to cast the query parameter into a specific type :

* `@DatePathParam(<parameter_name>)` for a date (parameter must be in ISO format)
* `@EnumPathParam({type: <type_of_enum>, key: <parameter_name>})` for an enum
* `@NumberPathParam(<parameter_name>)` for a number
* `@StringPathParam(<parameter_name>)` for a string

For **Body datas**, use `@BodyParam()`

Object injected into the parameter of the method will be serialized to the type of entity you passed in `@PaginatedResources()` or `@Resource()`.


Example:
```typescript
import { Controller, Get, Post } from '@nestjs/common'
import {
  BodyParam,
  DateQueryParam,
  EntityOptionsQueryParam,
  EnumQueryParam,
  NumberQueryParam,
  PaginatedEntitiesQueryParam,
  PathParam,
  StringQueryParam,
  EntityOptions, 
  PaginatedEntitiesOptions,
  PaginatedResources, 
  Resource,
  PaginatedListResult
} from '@u-iris/iris-back'

@Controller('/commands')
export class CommandEBS {

  constructor(private readonly commandLBS: CommandLBS) {
  }

  @Get('/')
  @PaginatedResources(CommandBE, 'commands', 10, 100)
  public async findAll(@PaginatedEntitiesQueryParam() paginatedResourcesOptions: PaginatedEntitiesOptions,
                       @NumberQueryParam('customer.id') idClient: number,
                       @EnumQueryParam({
                         type: CommandStateEnum,
                         key: 'commandState',
                       }) commandState: CommandStateEnum,
                       @StringQueryParam('reference') reference: string,
                       @DateQueryParam('deliveryDatas.deliveryDate.gte') deliveryDateGte: Date,
                       @DateQueryParam('deliveryDatas.deliveryDate.lte') beforeDateLivraison: Date,
                       @StringQueryParam('badfilter') badfilter: string,
                       @StringQueryParam('deliveryDatas.badfilter') deliveryDatasBadfilter: string,
  ): Promise<PaginatedListResult<CommandBE>> {
    return this.commandLBS.findWithPaginationResult(paginatedResourcesOptions, {
        'customer.id': idClient,
        'reference': reference,
        'state': commandState,
        'deliveryDatas.deliveryDate': {
          gte: deliveryDateGte,
          lte: beforeDateLivraison,
        },
        'badfilter': badfilter,
        'deliveryDatas.badfilter': deliveryDatasBadfilter,
      },
    )
  }

  @Get('/:id')
  @Resource(CommandBE)
  public async findById(@EntityOptionsQueryParam() queryableParam: EntityOptions, @PathParam('id') id: number): Promise<CommandBE> {
    return this.commandLBS.findById(id, queryableParam)
  }

  @Post('/')
  @Resource(CommandBE)
  public async createCommande(@EntityOptionsQueryParam() queryableParam: EntityOptions, @BodyParam() newCommande: CommandBE): Promise<CommandBE> {
    return this.commandLBS.createCommande(newCommande, queryableParam)
  }
}
```

### Other middlewares

If you want use middlewares for your Express Api :

```javascript
import express from 'express'
import { middlewares, Logger } from '@u-iris/iris-back'

const app = express()

// Get a winston logger
const logger = Logger.createDefault()

const middlewaresWithLogger = middlewares(logger)

// JSON parser
app.use('/actuator', middlewaresWithLogger.parseJSON)

// Actuator
app.use('/actuator', middlewaresWithLogger.actuator)

// set your routes

// Error handler
app.use(middlewaresWithLogger.errorHandler)

```

Severals middleware for Express are availables :

- actuator: expose technical web services for supervision
- enableCors: enable cors with cors plugin
- parseJSON: transform body request to a JSON object
- logRequests: log request
- enableCompression: enable compression with compression plugin
- enableSecurity: enable security with helmet plugin

You can use the default configuration by enabling all middlewares :

```javascript
// server.js
import express from 'express'
import { middlewares, Logger } from '@u-iris/iris-back'

const options = {
    expressApplication: null, // you can set your own application or let iris-back create it
    disableCors: true, // You can disable cors (enabled by default)
    disableCompression: true, // You can disable compression (enabled by default)
    disableSecurity: true // You can disable helmet security (enabled by default)
}
const app = middlewares.withMiddlewares((expressApplication) => {
  // use expressApplication to set your api routes
  expressApplication.use('/foo', (req, res) => {
    res.send({ foo: 'bar' })
  })
}, Logger.createDefault(), options)
export { app }
```

### Logger

You can create a winston logger that log to a file and/or to the console like that :

```js
import { Logger } from '@u-iris/iris-back'

const logger = Logger.create('debug', {
    appName: 'my-application', // app name
    appVersion: '1.0.0', // app version
    file: '/var/log/output.log', // output file
    enableConsole: true // enable console output
})
logger.info('my first log')
```

Use createDefault() method to use environment variable

```js
import { Logger } from '@u-iris/iris-back'

// process.env.LOG_LEVEL = 'debug'
// process.env.APP_NAME = 'my application'
// process.env.APP_VERSION = '1.0.0'
// process.env.LOG_FILE = '/var/log/output.log'
// console output is enabled
const logger = Logger.createDefault()

logger.info('my first log')
```

### TypeUtils

You can use that to convert a string variable to another type

```js
import { TypeUtils } from '@u-iris/iris-back'

let int = '8'
console.log(typeof int) //string
int = TypeUtils.convertToType(TypeUtils.TYPE.INT, int)
console.log(typeof int) //number

let date = '2017-12-14T16:34:10.234' // date must be formatted like YYYY-MM-DDTHH:mm:ss.SSS 
console.log(typeof date) // string
date = TypeUtils.convertToType(TypeUtils.TYPE.DATE, int)
console.log(typeof date) // Date
```

### PaginationUtils

PaginationUtils helps you to get pagination parameters from request and write response headers

```js
const app = express();
app.get('/number', function (req, res) {
    const defaultSize = 10;
    const maxSize = 100;
    
    // get size and page query parameters and convert them to number
    const params = paginationUtils.getPaginationParams(req, maxSize, defaultSize);
    
    // get list in database for offset params.size * params.page and count params.size
    const results = databaseService.find(params.size * params.page, params.size);
    
    // get total count in database
    const totalInDatabase = databaseService.count();
    
    // Write pagination headers and set response status (200 if results contains all items, 206 if results contains part of items)
    paginationUtils.generateResponse('resource', maxSize, defaultSize, totalInDatabase, results.length, req, res);
    
    // send results list in response body
    res.send(results);
})
```


## Contribution

```bash
# install dependencies
npm install

# build for production with minification
npm run build

# run unit tests
npm run test:unit

# run e2e tests
npm run test:e2e

# run all tests
npm run test
```

## Changelog
|Version|Comment|
|---|---|
|2.1.0|<ul><li>NestJS integration</li><li>TypeORM integration</li><li>implementation of Trace Context</li></ul>|
|2.0.0|<ul><li>Typescript migration</li><li>Refactorisation</li></ul>|
|1.0.0|init|
