<<<<<<< HEAD
# iris-back

> Backend Utils for Iris

## Build Setup

```bash
# install dependencies
npm install

# build for production with minification
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## Import in your project

```bash
# install dependency
npm i @u-iris/iris-back --save
```

## Actuator

If you want add actuator for your Express Api :

```js
import { actuator } from '@u-iris/iris-back'

const app = express()
actuator(logger).route(app)
```

## Express Utils

Severals middleware for Express are availables :

- parseJSON: transform body request to a JSON object
- logRequests: log debug request
- errorHandler: log the error and return the good status
- enableCors: enable cors with cors plugin
- returnApplicationJson: add to the header the content-type application/json

```js
import { expressUtils } from '@u-iris/iris-back'

const utils = expressUtils(logger)
const app = express()
app.use(utils.parseJSON)
```

## Logger

You can create a logger that log in a file and in the console like that :

```js
import { Logger } from '@u-iris/iris-back'

const logger = Logger.create('debug', 'd:\\temp\\myAppLog.log')
logger.info('my first log')
```

The library `winston` is used to create the logger.

## TypeUtils

You can use that to change variable's type

```js
import { TypeUtils } from '@u-iris/iris-back'

let int = '8'
console.log(typeof int) //string
await TypeUtils.defineType(TypeUtils.TYPE.INT, int)
console.log(typeof int) //number
```

## Advanced search 

## on mongodb

You can use searchUtils to use a advanced search (min, max , wildcard, list). If you want search with wildcard:

```js
import { SearchUtils } from '@u-iris/iris-back'

//Your search's object
let object = {
    id: 1
}

SearchUtils.searchStringObject(object, 'libelle', '*ui*')

console.log(object)
/*
object {
    id: 1,
    libelle: {
        $regex: `ui`i
    }
}
*/
```
## on PostgreSQL
To use an advanced search, you must have Sequelize

```js
import SearchUtilsPostgre from '@u-iris/searchUtilsPostgre'
  async function findAll(query) {
    let where = {}
    const searchUtilsPostgre = SearchUtilsPostgre(where, Sequelize.Op)
    if(query.minCapacity){
      searchUtilsPostgre.searchMin('capacity', Number(query.minCapacity))
    }
    if(query.maxCapacity){
      searchUtilsPostgre.searchMax('capacity', Number(query.maxCapacity))
    }
    if(query.title){
      searchUtilsPostgre.searchString('title', query.title)
    }
    if(query.mail){
      searchUtilsPostgre.searchList('mail', query.mail)
    }
    return await PaginationUtilsPostgreDAO.findWithPagination(Resource,query.size,query.page,where, query.sort)
  }
```

## Google Auth

To call the api google, you can use googleAuth to get a google authentification token

```js
import { googleAuth } from '@u-iris/iris-back'

const myGoogleAuth = googleAuth(
  {
    secretPath: 'd:/temp/mySecret.json',
    tokenPath: 'd:/temp/myToken.json'
  },
  logger,
  exceptions
)
const authClient = googleAuth.getGoogleAuthClient()
```

## Pagination

To use pagination you need to change your function that exposes your route (EBS) and your function that makes the request to the database (DAO).

### Pagination EBS

The EBS pagination will allow you to check the size and page requested by the customer, but also to return an appropriate header.

```js
import { PaginationUtilsEBS } from '@u-iris/iris-back'

commandesRouter.get('/', async (req, res) => {
  try {
    //StartOnPagination check if size and page are a number and check too Accept-Range
    await PaginationUtilsEBS.startOnPagination(req.query, 50)
    const response = await commandesLBS.findCommandes(req.query)
    //generatesResponse generate a header and a status of response
    await PaginationUtilsEBS.generatesResponse(
      'commande',
      50,
      response.count,
      response.response.length,
      req.headers.host + req.originalUrl,
      req.query,
      res
    )
    res.send(response.response)
  } catch (error) {
    res.send(error)
  }
})
```

### Pagination DAO

```js
import { PaginationUtilsDAO } from '@u-iris/iris-back'

export const findCommandes = async (query) => {
	try {
		let commandeFind = {}
        const commandesDB = await connect()
        //searchInDB create query and response paged
		return await PaginationUtilsDAO.searchInDb('commandes' , commandesDB ,commandeFind , query)

	} catch (error) {
		throw error
	}
```
=======
# iris-back

> Backend Utils for Iris

## Build Setup

```bash
# install dependencies
npm install

# build for production with minification
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## Import in your project

```bash
# install dependency
npm i @u-iris/iris-back --save
```

## Actuator

If you want add actuator for your Express Api :

```js
import { actuator } from '@u-iris/iris-back'

const app = express()
actuator(logger).route(app)
```

## Express Utils

Severals middleware for Express are availables :

- parseJSON: transform body request to a JSON object
- logRequests: log debug request
- errorHandler: log the error and return the good status
- enableCors: enable cors with cors plugin
- returnApplicationJson: add to the header the content-type application/json

```js
import { expressUtils } from '@u-iris/iris-back'

const utils = expressUtils(logger)
const app = express()
app.use(utils.parseJSON)
```

## Logger

You can create a logger that log in a file and in the console like that :

```js
import { Logger } from '@u-iris/iris-back'

const logger = Logger.create('debug', 'd:\\temp\\myAppLog.log')
logger.info('my first log')
```

The library `winston` is used to create the logger.

## TypeUtils

You can use that to change variable's type

```js
import { TypeUtils } from '@u-iris/iris-back'

let int = '8'
console.log(typeof int) //string
await TypeUtils.defineType(TypeUtils.TYPE.INT, int)
console.log(typeof int) //number
```

## Advanced search

## on mongodb

You can use searchUtils to use a advanced search (min, max , wildcard, list). If you want search with wildcard:

```js
import { SearchUtils } from '@u-iris/iris-back'

//Your search's object
let object = {
  id: 1
}

SearchUtils.searchStringObject(object, 'libelle', '*ui*')

console.log(object)
/*
object {
    id: 1,
    libelle: {
        $regex: `ui`i
    }
}
*/
```

## on PostgreSQL

To use an advanced search, you must have Sequelize. Advanced search allows you to search on list, on string with wildcard, between two number(min, max) or date(after, before)

```js
import SearchUtilsPostgre from '@u-iris/searchUtilsPostgre'
async function findAll(query) {
  /*You received this URI : https://app/resources?size=10&page=2&title=*ui*&maxCapacity=220&MinCapacity=200
  So your object query is :
  
    "size": 10,
    "page": 2,
    "title": "*ui*",
    "maxCapacity"= 220,
    "minCapacity"= 200
  }*/
  let whereGenerate = await SearchUtilsPostgre.generateWhere(query)
  /*Now object whereGenerate is:
  {
    "capacity": {
      [Sequelize.Op.lte]: 220,
      [Sequelize.Op.gte]: 200
      },
    "title":{
      [Sequelize.Op.iLike]: "%ui%"
    }
  }*/

  //Resource is model of sequelize
  return await Resource.findall({ where: whereGenerate })
}
```

But if you want choose attribute to use advanced search, you can use a function like this:

```js
import SearchUtilsPostgre from '@u-iris/searchUtilsPostgre'
async function findAll(query) {
  let whereGenerate = {}
  //you want your customer can search on min and max of capacity and search on a title with wildcard and search a mail's list
  /*You received this URI : https://app/resources?size=10&page=2&title=*ui*&maxCapacity=220&MinCapacity=200
  So your object query is :
  
    "size": 10,
    "page": 2,
    "title": "*ui*",
    "maxCapacity"= 220,
    "minCapacity"= 200
  }*/
  if (query.minCapacity) {
    searchUtilsPostgre.searchMin('capacity', Number(query.minCapacity), whereGenerate)
  }
  if (query.maxCapacity) {
    searchUtilsPostgre.searchMax('capacity', Number(query.maxCapacity), whereGenerate)
  }
  if (query.title) {
    searchUtilsPostgre.searchString('title', query.title, whereGenerate)
  }
  if (query.mail) {
    searchUtilsPostgre.searchList('mail', query.mail, whereGenerate)
  }
  /*Now object whereGenerate is:
  {
    "capacity": {
      [Sequelize.Op.lte]: 220,
      [Sequelize.Op.gte]: 200
      },
    "title":{
      [Sequelize.Op.iLike]: "%ui%"
    }
  }*/

  //Resource is model of sequelize
  return await Resource.findall({ where: whereGenerate })
}
```

## Google Auth

To call the api google, you can use googleAuth to get a google authentification token

```js
import { googleAuth } from '@u-iris/iris-back'

const myGoogleAuth = googleAuth(
  {
    secretPath: 'd:/temp/mySecret.json',
    tokenPath: 'd:/temp/myToken.json'
  },
  logger,
  exceptions
)
const authClient = googleAuth.getGoogleAuthClient()
```

## Pagination

To use pagination you need to change your function that exposes your route (EBS) and your function that makes the request to the database (DAO).

### Pagination EBS

The EBS pagination will allow you to check the size and page requested by the customer, but also to return an appropriate header.

```js
import { PaginationUtilsEBS } from '@u-iris/iris-back'

commandesRouter.get('/', async (req, res) => {
  try {
    //StartOnPagination check if size and page are a number and check too Accept-Range
    await PaginationUtilsEBS.startOnPagination(req.query, 50)
    const response = await commandesLBS.findCommandes(req.query)
    //generatesResponse generate a header and a status of response
    await PaginationUtilsEBS.generatesResponse(
      'commande',
      50,
      response.count,
      response.response.length,
      req.headers.host + req.originalUrl,
      req.query,
      res
    )
    res.send(response.response)
  } catch (error) {
    res.send(error)
  }
})
```

### Pagination DAO

```js
import { PaginationUtilsDAO } from '@u-iris/iris-back'

export const findCommandes = async (query) => {
	try {
		let commandeFind = {}
        const commandesDB = await connect()
        //searchInDB create query and response paged
		return await PaginationUtilsDAO.searchInDb('commandes' , commandesDB ,commandeFind , query)

	} catch (error) {
		throw error
	}
```
>>>>>>> add documentation for readme
