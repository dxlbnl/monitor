const webpack = require('webpack')
const config = require('sapper/webpack/config.js')
const postcss = require('postcss')
const postcssPresetEnv = require('postcss-preset-env')
const postcssImport = require('postcss-import')

const mode = process.env.NODE_ENV
const isDev = mode === 'development'

const postcssPlugins = [
  postcssImport(),
  postcssPresetEnv({
    stage: 0
  })
]

module.exports = {
  entry: config.client.entry(),
  output: config.client.output(),
  resolve: {
    extensions: ['.js', '.json', '.mjs', '.html', '.svg'],
    mainFields: ['svelte', 'module', 'browser', 'main']
  },
  module: {
    rules: [
      {
        test: /\.(html|svg)$/,
        use: {
          loader: 'svelte-loader',
          options: {
            hydratable: true,
            store: true,
            hotReload: true,
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
  mode,
  plugins: [
    isDev && new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.browser': true,
      'process.env.NODE_ENV': JSON.stringify(mode)
    })
  ].filter(Boolean),
  devtool: isDev && 'inline-source-map'
}
