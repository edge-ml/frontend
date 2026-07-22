import React, { useState } from "react";
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
      size="xs"
      value={selectedSorting}
      onChange={setSelectedSorting}
      data={Object.entries(sortingOptions).map(([value, label]) => ({
        value,
        label,
      }))}
      placeholder="Sort by"
      clearable
    />
  );
};

export default DatasetSorting;
