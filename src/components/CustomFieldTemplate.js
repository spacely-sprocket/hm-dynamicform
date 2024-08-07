// src/CustomFieldTemplate.js
import React from "react"

const CustomFieldTemplate = ({
  id,
  classNames,
  label,
  help,
  required,
  description,
  errors,
  children,
}) => (
  <div className={`${classNames} mb-4`}>
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
    )}
    {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    <div>{children}</div>
    {errors && <p className="mt-1 text-xs text-red-500">{errors}</p>}
    {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
  </div>
)

export default CustomFieldTemplate
