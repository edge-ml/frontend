import React, { useState } from "react";
import { Modal, Button, Group, Stack, Select, Text } from "@mantine/core";
import LabelingSetsFilter from "./filters/LabelingSetsFilter";
import TextSearchFilter from "./filters/TextSearchFilter";

const filtersDef = [
  { displayName: "Empty Datasets", value: "filterEmptyDatasets" },
  { displayName: "Text Search", value: "filterByName" },
  { displayName: "Labeling Sets", value: "labelings" },
];

const FilterSelectionModal = ({
  filterModalOpen,
  setFilterModalOpen,
  applyFilter,
  selectedFilter,
  setSelectedFilter,
  selectedFilterParams,
  setSelectedFilterParams,
  labelings,
  removeFilter,
}) => {
  const [currentFilter, setCurrentFilter] = useState(
    selectedFilter || filtersDef[0]
  );
  const [currenFilterParams, setCurrentFilterParams] =
    useState(selectedFilterParams);

  const renderFilter = () => {
    switch (currentFilter.value) {
      case "filterByName":
        return (
          <TextSearchFilter
            selectedFilter={selectedFilter}
            selectedFilterParams={selectedFilterParams}
            labelings={labelings}
            currenFilterParams={currenFilterParams}
            setCurrentFilterParams={setCurrentFilterParams}
          />
        );
      case "labelings":
        return (
          <LabelingSetsFilter
            selectedFilter={selectedFilter}
            selectedFilterParams={selectedFilterParams}
            labelings={labelings}
            currenFilterParams={currenFilterParams}
            setCurrentFilterParams={setCurrentFilterParams}
          />
        );
      default:
        return <Text>Display only datasets without time series.</Text>;
    }
  };

  return (
    <Modal
      opened={filterModalOpen}
      onClose={() => setFilterModalOpen(false)}
      title="Filter Selection"
      size="xl"
    >
      <Stack gap="md">
        <Select
          value={currentFilter.value}
          onChange={(val) => {
            const filter = filtersDef.find((f) => f.value === val);
            setCurrentFilterParams(undefined);
            setCurrentFilter(filter);
          }}
          data={filtersDef.map((f) => ({
            value: f.value,
            label: f.displayName,
          }))}
        />
        {renderFilter()}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="outline"
            color="red"
            onClick={() => {
              removeFilter();
              setFilterModalOpen(false);
            }}
          >
            Remove filter
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              applyFilter(currentFilter, currenFilterParams);
              setFilterModalOpen(false);
            }}
          >
            Apply
          </Button>
          <Button
            variant="outline"
            color="gray"
            onClick={() => setFilterModalOpen(false)}
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default FilterSelectionModal;
