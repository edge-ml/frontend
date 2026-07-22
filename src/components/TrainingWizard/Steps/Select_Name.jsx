import { TextInput } from "@mantine/core";
import React, { Fragment } from "react";

const Select_Name = ({ modelName, setModelName, screen }) => {
  return (
    <div style={{ margin: "0.5rem" }}>
      <h3 style={{ fontWeight: 700 }}>{screen + 1 + ". Model Metadata"}</h3>
      <TextInput
        label="Model Name"
        value={modelName}
        onChange={(e) => setModelName(e.target.value)}
        error={!modelName ? "Model name is required" : undefined}
        style={{ maxWidth: "350px" }}
      />
    </div>
  );
};

Select_Name.validate = ({ modelName }) => {
  if (!modelName) {
    return "Model name cannot be blank";
  }
};

export default Select_Name;
