# iris-back
iris-back is a set of tools for Typescript backend projects, based on powerfull frameworks like:
* [NestJS](https://nestjs.com/)
* [TypeORM](https://typeorm.io/#/)
* [Joi](https://github.com/hapijs/joi). 
* [winston](https://github.com/winstonjs/winston)
* [cls-hooked](https://github.com/jeff-lewis/cls-hooked)

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

* [Before](#before)
* [Application bootstrap](#application-bootstrap)
* [Application context](#application-context)
* [Business Entity](#business-entity)
    * [Database link](#database-link)
    * [Relations and allowed options](#relations-and-allowed-options)
    * [Business validator](#business-validator)
* [Exposition Business Service (Controller)](#exposition-business-service-controller)
    * [Define routes](#define-routes)
    * [Apply resources incerceptors](#apply-resources-incerceptors)
    * [Get parameters from request](#get-parameters-from-request)
* [Providers](#providers)
    * [Cls provider](#cls-provider)
    * [Logger](#logger)
    * [Message provider](#message-provider)
    * [Error provider](#error-provider)
* [Other middlewares](#other-middlewares)


### Before
Please note that iris-back is built on top of [NestJS](https://nestjs.com/) and [TypeORM](https://typeorm.io/#/). 

Before starting to use iris-back, you should read the official documentations of these frameworks. 

### Application bootstrap
To use iris-back in your NestJS application you should :
* Import IrisModule into your main module by calling `IrisModule.forRoot()`
* Define `TraceContextInterceptor` as the first interceptor in your main module and provided as APP_INTERCEPTOR (very important)
* Define `ExceptionFilter` as a global filter
* Call `setApplicationContext()`

Example:

```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { NestFactory, APP_INTERCEPTOR } from '@nestjs/core'
import { IrisModule, LoggingInterceptor, TraceContextInterceptor, ExceptionFilter, setApplicationContext } from '@u-iris/iris-back'

@Module({
  imports: [
    IrisModule.forRoot({
         logger: {
           appName: 'my-application',
           appVersion: '1.0.0',
           level: 'error',
           enableConsole: true
         },
         messagesSources: '/path/to/i18n.properties'
       })
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceContextInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    }]
})
class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    return undefined
  }
}
(async () => {
    const app = await NestFactory.create(AppModule)
    app.useGlobalFilters(new ExceptionFilter())
    setApplicationContext(app)
    app.listen(3000, () => {
      console.log.info(`Server running at http://127.0.0.1:3000/`)
    })
})()
```

### Application context
Application is a global store used to access injectable providers from outside a NestJS context. You must initialize application context by calling `setApplicationContext()` to use IrisModule.

```typescript
import { setApplicationContext } from '@u-iris/iris-back'

const app = await NestFactory.create(AppModule)
setApplicationContext(app)
```

### Business Entity
A business entity is an object related to a database and/or a resource exposed by a controller.

#### Database link
Define a business entity related to a database with TypeORM decorators.

Example:
```typescript
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity(`ORDER`)
export class OrderBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'REFERENCE', length: 10 })
  public reference: string

  @Column({ name: 'AMOUNT', nullable: true, type: 'float' })
  public amount?: number

  @Column({ name: 'STATE', nullable: false })
  public state?: CommandStateEnum

  @OneToMany(type => orderLineBE, orderLines => orderLines.order, {
    eager: false,
    cascade: true,
  })
  public orderLines: OrderLineBE[]

  @ManyToOne(type => AddressBE, {
    eager: true,
    cascade: true,
  })
  public billingAddress: AddressBE

  // Business Entity Part : all fields of a BEP will be saved into the business entity. 
  // BEP are used for a logical organization of your model
  @Column(type => DeliveryDataBEP, {
    prefix: '', // for embedded BEP, set typeorm prefix to ''
  })
  public deliveryData?: DeliveryDataBEP

  // eXternal Business Entity : content of an XBE is not saved in your database. You just need its ID.
  // XBE are generally provided from external APIs.
  @Column(type => CustomerXBE, {
    prefix: '', // for embedded XBE entity from external API, set typeorm prefix to ''
  })
  public customer: CustomerXBE
}
```
#### Relations and allowed options
**Relations** are used to define how your entity will be serialized from HTTP request and to HTTP response. A relation type can be :
* NONE : relation is removed from HTTP request and to HTTP response
* ASSOCIATION : only ID of the related entity is kept from HTTP request and to HTTP response
* ENTITY : all of the related entity is kept

Decorate your relations with `@Relation(<relation-entity-type>[, <type>])` with:
* `relation-entity-type`: either RelationEntity.ASSOCIATION, RelationEntity.ENTITY, or RelationEntity.NONE
* `type`: type of array if your relation is a OneToMany or ManyToMany (type is required for an array because typescript does not provide a way to automatically detect a parameterized type)

**Options** allow the consumer of your API to retrieve the content of the relations marked as ASSOCIATION or NONE.

Decorate your business entity class with `@AllowedOptions(...<relation_path>)` with:
* `relation_path`: a list of the business entity relations you want to allow as options. You can define a child entity like `field.field_of_child` (in this case, all content of the field and the field_of_child will be returned)

Please note that when relations are defined as ASSOCIATION or when options are enabled by the API consumer, content of the relation is filled until the exposition interceptor is called to hide part of it.

Example:
```typescript
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AllowedOptions, Relation, RelationEntity } from '@u-iris/iris-back'

@Entity(`ORDER`)
@AllowedOptions('orderLines', 'orderLines.product', 'customer')
export class OrderBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'REFERENCE', length: 10 })
  public reference: string

  @Column({ name: 'AMOUNT', nullable: true, type: 'float' })
  public amount?: number

  @Column({ name: 'STATE', nullable: false })
  public state?: CommandStateEnum

  // @Relation() applied to a field typeof Array must declare the type of array in parameter. This is a technical constraint of typescript
  @Relation(RelationEntity.ASSOCIATION, OrderLineBE)
  @OneToMany(type => OrderLineBE, orderLines => orderLines.command, {
    eager: false,
    cascade: true,
  })
  public orderLines: OrderLineBE[]

  // When applied to an object type, typeof field is not required
  @Relation(RelationEntity.ENTITY)
  @ManyToOne(type => AddressBE, {
    eager: true,
    cascade: true,
  })
  public billingAddress: AddressBE

  @Column(type => DeliveryDataBEP, {
    prefix: '',
  })
  public deliveryData?: DeliveryDataBEP

  @Relation(RelationEntity.ASSOCIATION)
  @Column(type => CustomerXBE, {
    prefix: '',
  })
  public customer: CustomerXBE
}
```

#### Business validator
Business validation rules are required to serialize HTTP request. If no @Relation and no @BusinessValidator is defined on a business entity field, this field will be ignored in the HTTP request.
Moreover, a business validator is used to define a constraint validator.

Example:
```typescript
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AllowedOptions, Relation, RelationEntity, BusinessValidator } from '@u-iris/iris-back'
import { Joi } from 'tsdv-joi/core'

@Entity(`ORDER`)
@AllowedOptions('orderLines', 'orderLines.product', 'customer')
export class OrderBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'REFERENCE', length: 10 })
  @BusinessValidator(Joi.string().required())
  public reference: string

  @Column({ name: 'AMOUNT', nullable: true, type: 'float' })
  @BusinessValidator(Joi.number())
  public amount?: number

  @Column({ name: 'STATE', nullable: false })
  // Constraint for enum
  @BusinessValidator(Joi.string().equal(Object.keys(CommandStateEnum).map(k => CommandStateEnum[k])))
  public state?: CommandStateEnum

  @Relation(RelationEntity.ASSOCIATION, OrderLineBE)
  @OneToMany(type => OrderLineBE, orderLines => orderLines.command, {
    eager: false,
    cascade: true,
  })
  public orderLines: OrderLineBE[]

  @Relation(RelationEntity.ENTITY)
  @ManyToOne(type => AddressBE, {
    eager: true,
    cascade: true,
  })
  public billingAddress: AddressBE

  @Column(type => DeliveryDataBEP, {
    prefix: '',
  })
  public deliveryData?: DeliveryDataBEP

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

  public async validateCommande(command: OrderBE): Promise<OrderBE> {
    return this.businessValidatorProvider.validate(command) // if a constraint is not validated, a BusinessException will be thrown
  }
}

```
### Exposition Business Service (Controller)

Exposition Business Service is used as NestJS Controller. It provides some features :
* serialization (request and response)
* interceptors for relations and options
* interceptors for pagination response (with pagination data in headers)

#### Define routes
First define your EBS routes with default decorators from NestJS (@Controller, @Get, @Post, @Put, @Delete).

See [NestJS documentation](https://docs.nestjs.com/controllers)

#### Apply resources incerceptors
Then you can apply resources interceptors (as NestJS interceptors) to manage the serialization and pagination of your business entities :

* `@PaginatedResources(<entity_type>, <resource__name>, <default_page_size>, <max_page_size>)` for search api with pagination:
    * `entity_type`: Type of your business entity
    * `resource__name`: name of the resource (used to generate response headers)
    * `default_page_size`: Page size per default (if query parameter 'page' is not set)
    * `max_page_size`: Page max size (query parameter 'size' should not exceed this)
    
Methods on which this decorator is applied must return a `Promise<PaginatedListResult<T>>` where T is the entity type you passed in `@PaginatedResources()`

* `@Resource(<entity_type>)` for an api that returns an entity object :
    * `entity_type`: Type of your business entity
    
Methods on which this decorator is applied must return a `Promise<T>` where T is the entity type you passed in `@Resource()`

#### Get parameters from request
To retrieve parameters from the HTTP request, you can use the following parameter decorators :

For **Query parameter**, use `@QueryParam(<data>)` with :
- `data`: name of the parameter or an object like { key: 'name of the parameter', required: boolean }. 
In some cases, data could contain other parameters.

If you want to cast the query parameter into a specific type :
* `@DateQueryParam(<parameter_name>)` for a date (parameter must be in ISO format)
* `@EnumQueryParam({type: <type_of_enum>, key: <parameter_name>})` for an enum
* `@NumberQueryParam(<parameter_name>)` for a number
* `@StringQueryParam(<parameter_name>)` for a string

For **Path parameter**, use `@PathParam(<parameter_name>)`

If you want to cast the path parameter into a specific type :

* `@DatePathParam(<parameter_name>)` for a date (parameter must be in ISO format)
* `@EnumPathParam({type: <type_of_enum>, key: <parameter_name>})` for an enum
* `@NumberPathParam(<parameter_name>)` for a number
* `@StringPathParam(<parameter_name>)` for a string

For **Body data**, use `@BodyParam()`

The object injected into the method's parameter will be serialized into the type of entity you passed in `@PaginatedResources()` or `@Resource()`.


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

@Controller('/orders')
export class CommandEBS {

  constructor(private readonly commandLBS: CommandLBS) {
  }

  @Get('/')
  @PaginatedResources(OrderBE, 'orders', 10, 100)
  public async findAll(@PaginatedEntitiesQueryParam() paginatedResourcesOptions: PaginatedEntitiesOptions,
                       @NumberQueryParam('customer.id') idClient: number,
                       @EnumQueryParam({
                         type: CommandStateEnum,
                         key: 'commandState',
                       }) commandState: CommandStateEnum,
                       @StringQueryParam('reference') reference: string,
                       @DateQueryParam('deliveryData.deliveryDate.gte') deliveryDateGte: Date,
                       @DateQueryParam('deliveryData.deliveryDate.lte') beforeDateLivraison: Date,
                       @StringQueryParam('badfilter') badfilter: string,
                       @StringQueryParam('deliveryData.badfilter') deliveryDataBadfilter: string,
  ): Promise<PaginatedListResult<OrderBE>> {
    return this.commandLBS.findWithPaginationResult(paginatedResourcesOptions, {
        'customer.id': idClient,
        'reference': reference,
        'state': commandState,
        'deliveryData.deliveryDate': {
          gte: deliveryDateGte,
          lte: beforeDateLivraison,
        },
        'badfilter': badfilter,
        'deliveryData.badfilter': deliveryDataBadfilter,
      },
    )
  }

  @Get('/:id')
  @Resource(OrderBE)
  public async findById(@EntityOptionsQueryParam() queryableParam: EntityOptions, @PathParam('id') id: number): Promise<OrderBE> {
    return this.commandLBS.findById(id, queryableParam)
  }

  @Post('/')
  @Resource(OrderBE)
  public async createCommande(@EntityOptionsQueryParam() queryableParam: EntityOptions, @BodyParam() newCommande: OrderBE): Promise<OrderBE> {
    return this.commandLBS.createCommande(newCommande, queryableParam)
  }
}
```
### Providers
IrisModule exports some useful providers.

#### Cls provider
ClsProvider is a provider which implements [TraceContext specifications](https://www.w3.org/TR/trace-context/). You can store data into ClsProvider to access it while the request is living. Data stored by ClsProvider is specific to the request lifecycle.

You can store data as you could do in JAVA with ThreadLocal. Javascript does not support ThreadLocal because NodeJS is working on a single thread. 
Instead of that, NodeJS provide a feature called [Async hooks](https://github.com/nodejs/node/blob/master/doc/api/async_hooks.md). ClsProvider use [cls-hooked](https://github.com/jeff-lewis/cls-hooked) library to implements Trace context.


Example:
```typescript
import { Injectable } from '@nestjs/common'
import { ClsProvider } from '@u-iris/iris-back'

@Injectable()
class MyService {
  public constructor(private readonly clsProvider: ClsProvider) {
  }
  public someAction() {
    this.clsProvider.set('a_key', 'a_value')
  } 
}

@Injectable()
class AnotherService {
  public constructor(private readonly clsProvider: ClsProvider) {
  }
  public someOtherAction() {
    this.clsProvider.get('a_key') // === 'a_value'
  } 
}
```

#### Logger
LoggerProvider allows you to log in Iris format (with trace-id and span-id from Trace context specifications).

We recommend to access the logger directly from the application context. `getLogger()` returns a [winston](https://github.com/winstonjs/winston) logger.

```typescript
import { getLogger } from '@u-iris/iris-back'

getLogger().debug('This is a debug log')
```

#### Message provider
MessageProvider allows you to programmatically create messages/strings using a .properties file.

You should define properties files in `IrisModule.forRoot()`. See [Application bootstrap](#application-bootstrap)

```typescript
import { Injectable } from '@nestjs/common'
import { MessageProvider } from '@u-iris/iris-back'

@Injectable()
class MyService {
  public constructor(private readonly messageProvider: MessageProvider) {
  }
  public someAction() {
    // Assuming you set a .properties file in IrisModule.forRoot()
    
    // file.properties
    // hello_world=Hello $name

    this.messageProvider.get('hello_world', {name: 'world'}) // returns 'Hello world'
    this.messageProvider.has('other') // returns false
  } 
}
```

#### Error provider
ErrorProvider allows you to create `IrisException` and get label from `MessageProvider` automatically by checking the error's code .

```typescript
import { Injectable } from '@nestjs/common'
import { ErrorProvider } from '@u-iris/iris-back'

@Injectable()
class MyService {
  public constructor(private readonly errorProvider: ErrorProvider) {
  }
  public someAction() {
    this.errorProvider.createBusinessException('field', 'code', {data1: 'val1'}) // create business exception
    this.errorProvider.createSecurityException('field', 'code', {data1: 'val1'}) // create security exception
    this.errorProvider.createTechnicalException('field', 'code', new Error()) // create technical exception
    const idNotFound = 1056
    this.errorProvider.createEntityNotFoundBusinessException('field', idNotFound) // create entity not found exception
    
  } 
}
```

### Other middlewares

You can use some middlewares in your application module configuration :

```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { getLogger, IrisModule, LoggingInterceptor, middlewares, TraceContextInterceptor } from '@u-iris/iris-back'

@Module({
  ...
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    const middlewaresWithLogger = middlewares()
    consumer.apply(middlewaresWithLogger.enableCors).forRoutes('/') // Enable CORS
    consumer.apply(middlewaresWithLogger.enableCompression).forRoutes('/') // Enable compression
    consumer.apply(middlewaresWithLogger.enableSecurity).forRoutes('/') // Enable security with helmet
    consumer.apply(middlewaresWithLogger.actuator).forRoutes('/actuator') // Enable actuator
    return consumer
  }
}
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
