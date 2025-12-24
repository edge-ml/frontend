import React, { useMemo, useState } from "react";
import { Autocomplete } from "@mantine/core";

import "./AutocompleteInput.css";

const normalizeSuggestion = (item) => {
  if (typeof item === "string") {
    return item;
  }
  if (item && typeof item === "object") {
    return item.username || item.userName || item.email || "";
  }
  return "";
};

const AutoCompleteInput = ({ getsuggestions, filter, onClick, onChange, ...props }) => {
  const [data, setData] = useState([]);

  const handleFetch = (value) => {
    if (!getsuggestions || value === "") {
      setData([]);
      return;
    }
    getsuggestions(value)
      .then((results) => {
        const normalized = (results || [])
          .map(normalizeSuggestion)
          .filter((item) => item !== "");
        const filtered = filter
          ? normalized.filter((item) => !filter.includes(item))
          : normalized;
        setData(filtered.slice(0, 5));
      })
      .catch(() => {
        setData([]);
      });
  };

  return (
    <div className="autocomplete-wrapper flex-grow-1">
      <Autocomplete
        id="autoCompleteInput"
        data={data}
        onChange={(value) => {
          onChange && onChange({ target: { value } });
          handleFetch(value);
        }}
        onItemSubmit={(item) => {
          const nextValue = item.value ?? item;
          onClick && onClick({ target: { value: nextValue } });
        }}
        autoComplete="off"
        {...props}
      />
    </div>
  );
};

export default AutoCompleteInput;
