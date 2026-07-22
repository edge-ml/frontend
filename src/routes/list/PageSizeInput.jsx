import React, { useState } from "react";
import { TextInput, Text } from "@mantine/core";

const PageSizeInput = ({ pageSize, setPageSize }) => {
  const [error, setError] = useState("");
  const [value, setValue] = useState(String(pageSize));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setValue(numericValue);
      if (numericValue.length < 1 || parseInt(numericValue) < 5) {
        setError("Please choose a size >= 5.");
      } else {
        setPageSize(parseInt(numericValue));
        setError("");
      }
    }
  };

  return (
    <div>
      <TextInput
        type="number"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter page size"
        error={error}
      />
    </div>
  );
};

export default PageSizeInput;
