# iris-back
iris-back is a set of tools for Typescript backend project, based on powerfull frameworks like:
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
* Healthchecker

## Install

```bash
$ npm install @u-iris/iris-back @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/typeorm @u-iris/iris-common reflect-metadata rxjs typeorm --save
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
* [Security](#security)
* [Healthchecker](#health-checker)
* [Other middlewares](#other-middlewares)


### Before
Please note that iris-back is built on top of [NestJS](https://nestjs.com/) and [TypeORM](https://typeorm.io/#/). 

Before starting to use iris-back, you should read the official documentation of theses frameworks. 

### Application bootstrap
To use iris-back in your NestJS application you should :
* Import IrisModule into your main module by calling `IrisModule.forRoot()`
* @deprecated ~~Define `TraceContextInterceptor` as the first interceptor in your main module and provided as APP_INTERCEPTOR (very important)~~
* Bootstrap application with your module by calling _bootstrapIrisApp()_

Example:

```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { IrisModule, bootstrapIrisApp, getLogger } from '@u-iris/iris-back'

@Module({
  imports: [
    IrisModule.forRoot({
         logger: {
           appName: 'my-application',
           appVersion: '1.0.0',
           level: 'error',
           enableConsole: true,
           dateFormat: 'YYYY-MM-DDTHH:mm:ssZ' // Moment.js dateFormat
         },
         messagesSources: '/path/to/i18n.properties'
       })
  ],
  providers: []
})
class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    return undefined
  }
}
(async () => {
  try {
      const port = 3000 // You can use env var NODE_REQUESTPORT instead
      const hostname = '0.0.0.0' // You can use env var NODE_REQUESTHOST instead
      await bootstrapIrisApp(AppModule, { port, hostname })
      getLogger().info(`Server running at http://127.0.0.1:${port}/`)
    } catch (e) {
      getLogger().error(e)
    }
})()
```

### Application context
Application context is a global store used to access injectable providers from outside a NestJS context. The context is automatically initialized if you bootstrap your application with the bootstrapIrisApp() method.

You can access any injectable bean from outside the NestJS context from this application context.

```typescript
import { Module, NestModule } from '@nestjs/common'
import { bootstrapIrisApp, getLogger } from '@u-iris/iris-back' import { getApplicationContext } from './iris.context'
@Module({
  // ...
})
class AppModule implements NestModule {
  // ...
}
await bootstrapIrisApp(AppModule)

const myInjectableBean = getApplicationContext().get(MyInjectableBeanClass) // return an instance of your bean
const logger = getLogger() // return the logger bean defined in IrisModule
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
  public state?: OrderStateEnum

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

  // Part of business entity : all fields of BEP will be saved into the business entity. 
  // BEP is used for a logical organization of your model
  @Column(type => DeliveryDataBEP, {
    prefix: '', // for embedded BEP, set typeorm prefix to ''
  })
  public deliveryData?: DeliveryDataBEP

  // External business entity : content of XBE is not saved in your database. You just need its ID.
  // XBE generally provides from external API.
  @Column(type => CustomerXBE, {
    prefix: '', // for embedded XBE entity from externe API, set typeorm prefix to ''
  })
  public customer: CustomerXBE
}
```
#### Relations and allowed options
**Relations** are used to define how your entity will be serialized from HTTP request and to HTTP response. A relation can be of type :
* NONE : relation is removed from HTTP request and to HTTP response
* ASSOCIATION : only ID of the related entity is kept from HTTP request and to HTTP response
* ENTITY : all of the related entity is kept

Decorate your relations with `@Relation(<relation-entity-type>[, <type>])` with:
* `relation-entity-type`: one of RelationEntity.ASSOCIATION, RelationEntity.ENTITY, RelationEntity.NONE
* `type`: function that returns type of array if your relation is a OneToMany or ManyToMany (type is required for an array because typescript does not provides a way to automatically detect a parameterized type)

**Options** allow the consumer of your API to retrieve the content of the relations marked as ASSOCIATION or NONE.

Decorate your business entity class with `@AllowedOptions(...<relation_path>)` with:
* `relation_path`: list of the business entity relations you want to allow as options. You can define a child entity like `field.field_of_child` (in this case, all content of the field and the field_of_child will be returned)

Please note that when relations are defined as ASSOCIATION or when options are enabled by API consumer, content of the relation is filled until the exposition interceptor is called to hide part of it.

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
  public state?: OrderStateEnum

  // @Relation() applied to a field typeof Array must declare the type of array in parameter. This is a technical constraint of typescript
  @Relation(RelationEntity.ASSOCIATION, () => OrderLineBE)
  @OneToMany(type => OrderLineBE, orderLines => orderLines.order, {
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
Business validation rules are required to serialize HTTP request. If no @Relation and no @BusinessValidator is defined on a business entity field, field from HTTP request will be ignored.
Moreover, a business validator is used to define a constraint validator.

Example:
```typescript
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AllowedOptions, Relation, RelationEntity, jf } from '@u-iris/iris-back'

@Entity(`ORDER`)
@AllowedOptions('orderLines', 'orderLines.product', 'customer')
export class OrderBE {

  @PrimaryGeneratedColumn('increment')
  public id?: number

  @Column({ name: 'REFERENCE', length: 10 })
  @jf.string().required()
  public reference: string

  @Column({ name: 'AMOUNT', nullable: true, type: 'float' })
  @jf.number()
  public amount?: number

  @Column({ name: 'STATE', nullable: false })
  // Constraint for enum
  @jf.string().equal(Object.keys(OrderStateEnum).map(k => OrderStateEnum[k]))
  public state?: OrderStateEnum

  @Relation(RelationEntity.ASSOCIATION, () => OrderLineBE)
  @OneToMany(type => OrderLineBE, orderLines => orderLines.order, {
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
export class OrderLBS {

  constructor(private readonly businessValidatorProvider: BusinessValidatorProvider) {
  }

  public async validateOrder(order: OrderBE): Promise<OrderBE> {
    return this.businessValidatorProvider.validate(order) // if a constraint is not validated, a BusinessException will be thrown
  }
}

```

If a business validation constraint is not verified, _businessValidatorProvider.validate(object)_ will throws a BusinessEntityException with errors containing :
* field : the field in error
* code: the code of the error (provided by Joi)
* label : the label of the error (provided by joi by default)

You can override the label in your messages.properties (that you have to set in the IrisModule.forRoot() parameter) by following this rules (sorted by priority):

```properties
error.<object_type_in_lower>.<field_name>.<joi_error_code>.label=<your message>
error.<object_type_in_lower>.<field_name>.<joi_error_code>=<your message>
error.<field_name>.<joi_error_code>.label=<your message>
error.<field_name>.<joi_error_code>=<your message>
error.<joi_error_code>.label=<your message>
error.<joi_error_code>=<your message>
```

Some variables will be injected to your message :
* $field : field name in error
* $value : value in error
* $parentType : object type in lower
* $limit : value of limit for some constraints (greater, lesser, maxLength, etc.)
For example :
```typescript

# dto.ts
class DTO {
  class DTO {
  
    @jf.number().greater(0)
    public count: number
  
    @jf.string().required()
    public name: string
  
  }
}

# messages.properties
error.dto.count.number.greater=DTO must have count greater that $limit
error.any.required=Field $field is required

# main.ts
const object = new DTO()
object.count = -1
businessValidatorProvider.validate(object) 

/* will throw exception with errors
[
  {
    field: 'count',
    limit: 0,
    value: -1,
    label: 'DTO must have count greater that 0',
  },
  {
    field: 'name',
    label: 'Field name is required',
  }
]
*/
```



### Exposition Business Service (Controller)

Exposition Business Service is used as NestJS Controller. It provides some features :
* serialization (request and response)
* interceptors for relations and options
* interceptors for pagination response (with pagination data in headers)

#### Define routes
First define your routes of EBS with default decorators from NestJS (@Controller, @Get, @Post, @Put, @Delete).

see [NestJS documentation](https://docs.nestjs.com/controllers)

#### Apply resources incerceptors
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

#### Get parameters from request
To retrieve parameters from the HTTP request, use this parameter decorators :

For **Query parameter**, use `@QueryParam(<data>)` with :
- `data`: name of the parameter or an object like { key: 'name of the parameter', required: boolean } 
in some cases, data could contain other parameters.

If you want to cast the query parameter into a specific type :
* `@DateQueryParam(<parameter_name>)` for a date (parameter must be in ISO format)
* `@EnumQueryParam({type: <type_of_enum>, key: <parameter_name>})` for an enum
* `@NumberQueryParam(<parameter_name>)` for a number
* `@StringQueryParam(<parameter_name>)` for a string

For **Path parameter**, use @PathParam(<parameter_name>)

If you want to cast the path parameter into a specific type :

* `@DatePathParam(<parameter_name>)` for a date (parameter must be in ISO format)
* `@EnumPathParam({type: <type_of_enum>, key: <parameter_name>})` for an enum
* `@NumberPathParam(<parameter_name>)` for a number
* `@StringPathParam(<parameter_name>)` for a string

For **Body data**, use `@BodyParam()`

Object injected into the method's parameter will be serialized into the type of the parameter or the type passed in parameter of `@BodyParam()`.

Note that if the parameter is of type Array, you **must** set the type of array in `@BodyParam()`.


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
export class OrderEBS {

  constructor(private readonly orderLBS: OrderLBS) {
  }

  @Get('/')
  @PaginatedResources(OrderBE, orders, 10, 100)
  public async findAll(@PaginatedEntitiesQueryParam() paginatedResourcesOptions: PaginatedEntitiesOptions,
                       @NumberQueryParam('customer.id') idClient: number,
                       @EnumQueryParam({
                         type: OrderStateEnum,
                         key: 'orderState',
                       }) orderState: OrderStateEnum,
                       @StringQueryParam('reference') reference: string,
                       @DateQueryParam('deliveryData.deliveryDate.gte') deliveryDateGte: Date,
                       @DateQueryParam('deliveryData.deliveryDate.lte') beforeDateLivraison: Date,
                       @StringQueryParam('badfilter') badfilter: string,
                       @StringQueryParam('deliveryData.badfilter') deliveryDataBadfilter: string,
  ): Promise<PaginatedListResult<OrderBE>> {
    return this.orderLBS.findWithPaginationResult(paginatedResourcesOptions, {
        'customer.id': idClient,
        'reference': reference,
        'state': orderState,
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
    return this.orderLBS.findById(id, queryableParam)
  }

  @Post('/')
  @Resource(OrderBE)
  public async createOrder(@EntityOptionsQueryParam() queryableParam: EntityOptions, @BodyParam() newOrder: OrderBE): Promise<OrderBE> {
    return this.orderLBS.createOrder(newOrder, queryableParam)
  }

  @Put('/:id/orderLines')
  @Resource(OrderBE)
  public async updateOrderLines(@PathParam('id') id: number, @BodyParam(OrderLineBE) orderLines: OrderLineBE[]): Promise<OrderBE> {
    return this.orderLBS.updateOrderLines(id, orderLines)
  }

}
```
### Providers
IrisModule exports some useful providers.

#### Cls provider
ClsProvider is a provider which implements [TraceContext specifications](https://www.w3.org/TR/trace-context/). You can store data into ClsProvider to access them while the request is living. Data stored by ClsProvider is specific to the request lifecycle.

You can store data as you could do that in JAVA with ThreadLocal. Javascript does not support ThreadLocal because NodeJS is working on a single thread. 
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

We recommend to access the logger directly from the application context. `getLogger()` returns a winston logger.

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
ErrorProvider allows you to create `IrisException` and get label from `MessageProvider` automatically by checking the code of the error.


```typescript
import { Injectable } from '@nestjs/common'
import { ErrorProvider } from '@u-iris/iris-back'

@Injectable()
class MyService {
  public constructor(private readonly errorProvider: ErrorProvider) {
  }
  public someAction() {
    this.errorProvider.createBusinessException('field', 'code', {data1: 'val1'}) // create business exception
    this.errorProvider.createBusinessException({field: 'field', code: 'code', label: 'label', datas: {val: 'val1'}}) // create business exception
    this.errorProvider.createSecurityException('field', 'code', {data1: 'val1'}) // create security exception
    this.errorProvider.createTechnicalException('field', 'code', new Error()) // create technical exception
    const idNotFound = 1056
    this.errorProvider.createEntityNotFoundBusinessException('field', idNotFound) // create entity not found exception
    
  } 
}

# messages.properties
error.field.code.label=Field $field is in error with value $value
```

### Security
You can enable security by implementing AuthenticationService and/or AuthorizationService.

The AuthenticationService is used to retrieve a user from a request.

```typescript
class MyAuthenticationProvider implements AuthenticationService {
  public async getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | undefined> {
    return request.headers.authorization ? myService.getUser(request.headers.authorization) : undefined
  }
}
```

The AuthorizationService is used to validate user authorization from a request.

```typescript
class MyAuthorizationProvider implements AuthorizationService {
  public async validateAuthorization(request: Request, ...roles: string[]): Promise<boolean> {
    return request.user && request.user.roles.some(r => roles.indexOf(r) > -1)
  }
}
```

Once your have create your own implementation, you need to define your beans into the iris module options.

```typescript
@Module({
  imports: [
    IrisModule.forRoot({
         authenticationProvider: MyAuthenticationProvider,
         authorizationProvider: MyAuthorizationProvider
       })
  ]
  // ...
})
class AppModule implements NestModule {
  // ...
}
```

To secure and enpoint you can add roles required for each resource with @Secured decorator :
```typescript

@Controller('/')
@Secured('ROLE_1', 'ROLE_2') // MyAuthorizationProvider.validateAuthorization(request, 'ROLE_1', 'ROLE_2') will be called and must return true to enable access to the controller
class SecuredController {

}

@Controller('/')
class UnsecuredController {

  @Secured('ROLE_1', 'ROLE_2')
  @Get('/')
  public async foo():Promise<string> {
    return 'bar'
  }
}
```

You can enable security on your application globally by setting secure option to the IrisModule.forRoot() :

```typescript
@Module({
  imports: [
    IrisModule.forRoot({
         //...
        secure: boolean | string | string[]
       })
  ]
  // ...
})
class AppModule implements NestModule {
  // ...
}
```

You can set the secure option with :
* boolean : if true, all the application need an authorization with role USER, if false, disable the security.
* string : a role
* string[] : one of the roles is required to access the application

You can configure the security of your application once globally with the secure option then by adding @Secured() on your controllers you can replace the global configuration.

To disable the security on a controller or a method of a controller, you can use @Unsecured() decorator.
 
> IrisModule will automatically inject the user returned by your authenticationProvider into the request _user_ field and the cls context (you can get the user by calling clsProvider.getAuthenticatedUser())

### Health Checker
Health checker is enabled by default by iris module (this can be disabled in the iris module options. The default path is **/actuator** (this can be overridden in the iris module options). It provides some endpoints :
* /health : get server health status: UP or DOWN (this will check typeorm connections)
* /info : get basics informations such as project name, version and git informations about commit, branch etc.

**IMPORTANT**: To get this information the middleware have some sort of logic:

When the express app is executed with node app.js or npm start the module will look for a file named package.json where the node command was launched.
Git information will show only if exists a git.properties file where the app was launched. You can use [node-git-info](https://www.npmjs.com/package/node-git-info) to generate this file.

* /metrics : get memory usage and uptime. This endpoint is **secured** and requires a specific ROLE to access it.
* /env : get environment variables. This endpoint is **secured** and requires a specific ROLE to access it.

You can configure the health checker by setting this options in the iris module options **actuatorOptions** field :

| name | default value | description |
|---|---|---|
| enable | true | enable or disable the health checker globally |
| endpoint | '/actuator' | main endpoint of the health checker services |
| role | 'ACTUATOR' | Required role to access to secured healh checker endpoints |
| enableTypeOrm | true | enable or disable the check of typeorm connections in /info service |
| gitMode | 'simple' | level of git informations returned by /info service  ('simple' or 'full') |


### Other middlewares
Some middlewares are automatically added by IrisModule : 
* compression (with [compression](https://github.com/expressjs/compression))
* cors (with [cors](https://github.com/expressjs/cors))
    * Default configuration : 
    
```javascript
{
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Element', 'X-Total-Page', 'X-Page-Element-Count', 'Accept-Ranges', 'Content-Range', 'Link'],
  }
```
* security (with [helmet](https://github.com/helmetjs/helmet))

You can disable or configure each of them with iris module options. See [documentation in code](src/modules/config-module/config-holder.ts).

If you want to add more middlewares, please follow the NestJS [middlewares documentation](https://docs.nestjs.com/middleware).

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
see [changelog](CHANGELOG.md)
