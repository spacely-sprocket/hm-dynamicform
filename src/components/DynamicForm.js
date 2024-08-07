import React, { useState } from "react"
import { useQuery, useMutation, gql } from "@apollo/client"
import Form from "@rjsf/core"
import validator from "@rjsf/validator-ajv8"
import CustomTextWidget from "./CustomTextWidget"
import CustomFieldTemplate from "./CustomFieldTemplate"

const GET_VALIDATION_SCHEMA = gql`
  query GetValidationSchema($collection: String!) {
    mySubgraph_getValidationSchema(collection: $collection)
  }
`

const SUBMIT_FORM_DATA = gql`
  mutation SubmitFormData($collection: String!, $data: String!) {
    mySubgraph_insertFormData(collection: $collection, formData: $data) {
      _id
      error {
        operatorName
        schemaRulesNotSatisfied {
          operatorName
          propertiesNotSatisfied {
            propertyName
            description
          }
        }
      }
    }
  }
`

const transformSchema = (schema) => {
  if (!schema || !schema.properties) return { type: "object", properties: {} }

  const newSchema = {
    type: "object",
    properties: {},
  }
  for (const key in schema.properties) {
    const property = schema.properties[key]
    newSchema.properties[key] = {
      type:
        property.bsonType === "objectId"
          ? "string"
          : property.bsonType === "date"
          ? "string"
          : property.bsonType,
      description: property.description,
    }
    if (property.bsonType === "date") {
      newSchema.properties[key].format = "date"
    } else if (property.bsonType === "objectId") {
      newSchema.properties[key].format = "string"
    }
  }
  return newSchema
}

const DynamicForm = ({ collection }) => {
  const { loading, error, data } = useQuery(GET_VALIDATION_SCHEMA, {
    variables: { collection },
  })

  const [submitFormData] = useMutation(SUBMIT_FORM_DATA)
  const [successMessage, setSuccessMessage] = useState(null)
  const [documentId, setDocumentId] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const onSubmit = async ({ formData }) => {
    try {
      const response = await submitFormData({
        variables: {
          collection,
          data: JSON.stringify(formData),
        },
      })
      const returnedData = response.data.mySubgraph_insertFormData
      if (returnedData._id) {
        setSuccessMessage("Form submitted successfully!")
        setDocumentId(returnedData._id)
        setErrorMessage(null)
      } else if (returnedData.error) {
        setSuccessMessage(null)
        setDocumentId(null)
        setErrorMessage({
          operatorName: returnedData.error.operatorName,
          schemaRulesNotSatisfied: returnedData.error.schemaRulesNotSatisfied,
        })
      }
      console.log("Form submitted successfully:", response)
    } catch (err) {
      console.error("Error submitting form:", err)
      console.error("Error details:", err.graphQLErrors, err.networkError)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  const schema = transformSchema(
    data?.mySubgraph_getValidationSchema?.$jsonSchema
  )

  const uiSchema = Object.keys(schema.properties || {}).reduce((acc, key) => {
    acc[key] = {
      "ui:widget": "custom",
    }
    return acc
  }, {})

  const widgets = {
    custom: CustomTextWidget,
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Dynamic Form for <span className="underline">{collection}</span>{" "}
        collection
      </h1>
      {schema ? (
        <Form
          schema={schema}
          uiSchema={uiSchema}
          onSubmit={onSubmit}
          validator={validator}
          FieldTemplate={CustomFieldTemplate}
          widgets={widgets}
          className="space-y-6"
        />
      ) : (
        <p className="text-red-500">
          No validation schema found for this collection!
        </p>
      )}
      {successMessage && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
          <p>{successMessage}</p>
          <p>Document ID: {documentId}</p>
        </div>
      )}
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p>Error: {errorMessage.operatorName}</p>
          {Array.isArray(errorMessage.schemaRulesNotSatisfied) &&
            errorMessage.schemaRulesNotSatisfied.map((rule, index) => (
              <div key={index}>
                <p>Rule: {rule?.operatorName}</p>
                {Array.isArray(rule.propertiesNotSatisfied) &&
                  rule.propertiesNotSatisfied.map((prop, propIndex) => (
                    <p key={propIndex}>
                      Property: {prop.propertyName} - {prop.description}
                    </p>
                  ))}
                {Array.isArray(rule.missingProperties) &&
                  rule.missingProperties.map((prop, propIndex) => (
                    <p key={propIndex}>Missing Property: {prop}</p>
                  ))}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default DynamicForm
