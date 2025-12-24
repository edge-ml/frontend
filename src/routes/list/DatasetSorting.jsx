import React from "react";
import { Select } from "@mantine/core";

const sortingOptions = {
  alphaDesc: "Alphabetical (descending)",
  alphaAsc: "Alphabetical (ascending)",
  dateDesc: "Recording Date (descending)",
  dateAsc: "Recording Date (ascending)",
};

const DatasetSorting = ({ setSelectedSorting, selectedSorting }) => {
  return (
    <Select
      className="dataset-sorting"
      placeholder="Sort by"
      value={selectedSorting || null}
      data={Object.entries(sortingOptions).map(([value, label]) => ({
        value,
        label,
      }))}
      onChange={(value) => {
        if (value) {
          setSelectedSorting(value);
        }
      }}
      allowDeselect={false}
    />
  );
};

export default DatasetSorting;
