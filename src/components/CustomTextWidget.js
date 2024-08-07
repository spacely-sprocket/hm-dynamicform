import React from "react"

const CustomTextWidget = (props) => {
  return (
    <input
      type="text"
      className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      value={props.value || ""}
      required={props.required}
      onChange={(event) => props.onChange(event.target.value)}
    />
  )
}

export default CustomTextWidget
