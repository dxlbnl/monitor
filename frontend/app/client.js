import { init } from 'sapper/runtime.js'
import { routes } from './manifest/client.js'
import App from './App.html'
import { Store } from './store.js'

init({
  target: document.querySelector('#sapper'),
  routes,
  App,
  store: data => {
    return new Store({
      api: 'http://api.net.dock/graphql',
      data
    })
  }
})
