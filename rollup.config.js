import multiEntry from 'rollup-plugin-multi-entry'
import minify from 'rollup-plugin-minify-es'

const rootDirectory = 'src'
const configs = [
  {
    input: `${rootDirectory}/**/*.js`,
    output: {
      file: `dist/index.js`,
      format: 'cjs',
    },
    plugins: [multiEntry(), minify()],
  },
]

module.exports = configs
