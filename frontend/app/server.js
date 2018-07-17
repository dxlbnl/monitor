import polka from 'polka'
import compression from 'compression'
import sapper from 'sapper'
import serve from 'serve-static'
import { routes } from './manifest/server.js'
// import { getGql } from '../lib/graphql.js'
import fetch from 'node-fetch'

import App from './App.html'
import { Store } from './store.js'

async function authenticate (req, res, next) {
  const {
    cookie
  } = req.headers

  if (cookie) {
    const [name, token] = cookie.split('=')

    if (name === 'token') {
      req.user = {
        token
      }
    }
  }
  console.log(`${req.method}: ${req.url}`)
  next() // done, woot!
}

polka() // You can also use Express
  .use(authenticate)
  .use(
    compression({ threshold: 0 }),
    serve('assets'),
    sapper({
      routes,
      App,
      store: request => {
        return new Store({
          api: 'http://api/graphql',
          fetch,
          token: request.user && request.user.token
        })
      }
    })
  )
  .listen(process.env.PORT)
