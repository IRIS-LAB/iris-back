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

## Actuator

If you want add actuator for your Express Api :

```js
import { actuator } from '@ugieiris/iris-back'

const app = express()
actuator(logger).route(app)
```
