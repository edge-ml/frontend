import React, { useState, useEffect } from "react";
import { TextInput } from "@mantine/core";

const TextSearchFilter = ({
  selectedFilter,
  selectedFilterParams,
  labelings,
  currentFilterParams,
  setCurrentFilterParams,
}) => {
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    if (selectedFilter && selectedFilter.value === "filterByName") {
      setUserInput(selectedFilterParams);
    } else {
      setCurrentFilterParams("");
    }
    return () => {};
  }, []);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    setCurrentFilterParams(e.target.value);
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        {"Search for datasets via name:\n"}
      </div>
      <div>
        <TextInput
          placeholder="Search..."
          value={userInput}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default TextSearchFilter;
