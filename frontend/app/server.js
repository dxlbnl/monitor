import polka from 'polka'
import compression from 'compression'
import sapper from 'sapper'
import serve from 'serve-static'
import { routes } from './manifest/server.js'
// import { getGql } from '../lib/graphql.js'

import { InMemoryCache } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'
import { createProvider } from 'svelte-apollo'
import ApolloClient from 'apollo-boost'

import App from './App.html'
import { Store } from 'svelte/store.js'

import fetch from 'node-fetch'
global.fetch = fetch

polka() // You can also use Express
  .use(
    compression({ threshold: 0 }),
    serve('assets'),
    sapper({
      routes,
      App,
      store: req => {
        const client = new ApolloClient({
          ssrMode: true,
          link: createHttpLink({
            uri: 'http://monitor-graphql-1.monitor.dock/v1alpha1/graphql',
            credentials: 'same-origin',
            headers: {
              cookie: req.headers.Cookie
            }
          }),
          cache: new InMemoryCache()
        })
        const graphql = createProvider(client, { ssr: true })

        return new Store({ graphql })
      }
    })
  )
  .listen(process.env.PORT)
