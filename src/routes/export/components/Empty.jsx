import React from "react";
export const Empty = (props) => (
  <div className="w-100 h-100 d-flex justify-content-center align-items-center text-secondary" {...props}>
    {props.children || "No data available"}
  </div>
);
