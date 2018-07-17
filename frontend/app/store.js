import { Store as SvelteStore } from 'svelte/store.js'

import { ApolloProvider } from 'svelte-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'

import gql from 'graphql-tag'

function customizeFetch (fetch = global.fetch) {
  return async (uri, options) => {
    const initialResponse = await fetch(uri, options)
    // Check status code to figure out whether to reload, don't consume the response body
    // const initialData = await initialResponse.json()

    if (!initialResponse.ok) {
      const next = global.window && window.location.pathname

      throw new Error({
        error: 'Not logged in',
        next
      })
    }

    // if (initialData.errors) {
    //   console.log("We've got initial errors")
    // }

    return initialResponse
  }
}

export class Store extends SvelteStore {
  constructor ({api, token, fetch, ...initial }) {
    let link = createHttpLink({
      uri: api,
      credentials: 'include',
      fetch: customizeFetch(fetch)
    })

    if (token) {
      // AuthLink
      console.log('Setting context', token, api)
      link = setContext((_, { headers }) => {
        // return the headers to the context so httpLink can read them
        return {
          headers: {
            ...headers,
            authorization: token
          }
        }
      }).concat(link)
    }

    const client = new ApolloClient({
      link,
      cache: new InMemoryCache()
    })

    const graphql = new ApolloProvider({ client })
    super({
      graphql,
      ...initial
    })
  }

  async getUser () {
    const { graphql } = this.get()

    const {
      data: {
        user
      },
      errors
    } = await graphql.client.query({
      query: gql`{
          user: person {
            name permissions { name }
          }
      }`})

    this.set({
      user
    })
    return user
  }
}
