import { Box, Text, TextInput } from "@mantine/core";
import React from "react";

const Select_Name = ({ modelName, setModelName, screen }) => {
  return (
    <Box m="sm">
      <Text fw={700} size="lg">
        {screen + 1 + ". Model Metadata"}
      </Text>
      <TextInput
        label="Model Name"
        value={modelName}
        onChange={(e) => setModelName(e.target.value)}
        error={!modelName ? "Model name cannot be blank" : null}
        style={{ maxWidth: "350px" }}
        mt="sm"
      />
    </Box>
  );
};

Select_Name.validate = ({ modelName }) => {
  if (!modelName) {
    return "Model name cannot be blank";
  }
};

export default Select_Name;
