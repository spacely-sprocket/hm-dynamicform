// src/App.js
import React from "react"
import { ApolloProvider } from "@apollo/client"
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom"
import client from "./ApolloClient"
import DynamicForm from "./components/DynamicForm"

const CollectionForm = () => {
  const { collection } = useParams()
  return <DynamicForm collection={collection} />
}

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/:collection" element={<CollectionForm />} />
        </Routes>
      </Router>
    </ApolloProvider>
  )
}

export default App
