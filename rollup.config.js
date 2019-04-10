import multiEntry from 'rollup-plugin-multi-entry'

const rootDirectory = 'src'
const configs = [
  {
    input: `${rootDirectory}/**/*.js`,
    output: {
      file: `dist/index.js`,
      format: 'cjs',
    },
    plugins: [multiEntry()],
  },
]

module.exports = configs
