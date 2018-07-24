import { init } from 'sapper/runtime.js'
import { routes } from './manifest/client.js'
import App from './App.html'

import ApolloClient from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { getOperationAST } from 'graphql/utilities' // ES6

import { createProvider } from 'svelte-apollo'
import { Store } from 'svelte/store.js'

init({
  target: document.querySelector('#sapper'),
  routes,
  App,
  store: data => {
    // Create WebSocket link

    const link = ApolloLink.split(
      operation => {
        const operationAST = getOperationAST(operation.query, operation.operationName)
        return !!operationAST && operationAST.operation === 'subscription'
      },
      new WebSocketLink({
        uri: 'ws://monitor-graphql-1.monitor.dock/v1alpha1/graphql',
        options: {
          reconnect: true,
          connectionParams: {}
        }
      }),
      new HttpLink({ uri: 'http://monitor-graphql-1.monitor.dock/v1alpha1/graphql' })
    )

    const apolloClient = new ApolloClient({
      link,
      cache: new InMemoryCache(window.__APOLLO_STATE)
    })

    return new Store({
      ...data,
      graphql: createProvider(apolloClient, { from: data && data.graphql })
    })
  }
})
