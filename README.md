# iris-back

> Backend Utils for Iris

## Installation

```bash
npm install @u-iris/iris-back --save
```

## Usage

### Middlewares for express

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
- errorHandler: log the error and write errors into response with the good HTTP status
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
|2.0.0|<ul><li>Typescript migration</li><li>Refactorisation</li></ul>|
|1.0.0|init|
