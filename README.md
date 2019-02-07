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
npm i @ugieiris/iris-back --save
```

## Logger

You can create a logger that log in a file and in the console like that :

```js
import { Logger } from '@ugieiris/iris-back'

const logger = Logger.create('debug', 'd:\\temp\\myAppLog.log')
logger.info('my first log')
```

The library `winston` is used to create the logger.

## TypeUtils

You can use that to change variable's type

```js
import { TypeUtils } from '@ugieiris/iris-back'

let int = '8'
console.log(typeof int) //string
await TypeUtils.defineType(TypeUtils.TYPE.INT, int)
console.log(typeof int) //number

```
