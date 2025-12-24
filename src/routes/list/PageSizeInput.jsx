import React, { useState } from "react";
import { NumberInput, Text } from "@mantine/core";

const PageSizeInput = ({ pageSize, setPageSize }) => {
  const [error, setError] = useState("");
  const [value, setValue] = useState(pageSize);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value;
      //only numeric
      const numericValue = inputValue.replace(/[^0-9]/g, "");
      setValue(numericValue);
      if (numericValue.length < 1 || numericValue < 5) {
        setError("Please choose a size >= 5.");
      } else {
        setPageSize(numericValue);
        setError("");
      }
      setPageSize(numericValue);
    }
  };

  return (
    <div className="me-2">
      <NumberInput
        name="page size"
        value={value}
        onChange={(nextValue) => {
          if (typeof nextValue === "number" || nextValue === "") {
            setValue(nextValue);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Enter page size"
        min={1}
      />
      {error && (
        <Text size="xs" c="red" mt={4}>
          {error}
        </Text>
      )}
    </div>
  );
};

export default PageSizeInput;
