import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"

// Create an HttpLink to your GraphQL endpoint
const httpLink = new HttpLink({ uri: "http://localhost:3000/graphql" }) // Replace with your GraphQL endpoint

// Use setContext to add headers to each request
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem("token")

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      "x-hasura-role": "admin",
    },
  }
})

// Combine the authLink and httpLink
const link = authLink.concat(httpLink)

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
})

export default client
