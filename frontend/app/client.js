import { init } from 'sapper/runtime.js'
import { routes } from './manifest/client.js'
import App from './App.html'

import ApolloClient from 'apollo-boost'
import { createProvider } from 'svelte-apollo'
import { Store } from 'svelte/store.js'

init({
  target: document.querySelector('#sapper'),
  routes,
  App,
  store: data => {
    const client = new ApolloClient({ uri: 'http://monitor-graphql-1.monitor.dock/graphql' })

    return new Store({
      ...data,
      graphql: createProvider(client, { from: data && data.graphql })
    })
  }
})
