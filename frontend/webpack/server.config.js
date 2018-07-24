const config = require('sapper/webpack/config.js')
const pkg = require('../package.json')

const postcss = require('postcss')
const postcssPresetEnv = require('postcss-preset-env')
const postcssImport = require('postcss-import')

const postcssPlugins = [
  postcssImport(),
  postcssPresetEnv({
    stage: 0
  })
]

module.exports = {
  entry: config.server.entry(),
  output: config.server.output(),
  target: 'node',
  resolve: {
    extensions: ['.js', '.json', '.mjs', '.html', '.svg'],
    mainFields: ['svelte', 'module', 'browser', 'main']
  },
  externals: Object.keys(pkg.dependencies).filter(name => !name.startsWith('@svelte')),
  module: {
    rules: [
      {
        test: /\.(html|svg)$/,
        use: {
          loader: 'svelte-loader',
          options: {
            css: false,
            generate: 'ssr',
            dev: true,
            store: true,
            preprocess: {
              style: ({ content, attributes, filename }) => {
                return postcss(postcssPlugins)
                  .process(content, { from: filename })
                  .then(result => {
                    return { code: result.css, map: null }
                  })
                  .catch(err => {
                    console.log('failed to preprocess style', err)
                  })
              }
            }
          }
        }
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: postcssPlugins
            }
          }
        ]
      }
    ]
  },
  mode: process.env.NODE_ENV,
  performance: {
    hints: false // it doesn't matter if server.js is large
  }
}
