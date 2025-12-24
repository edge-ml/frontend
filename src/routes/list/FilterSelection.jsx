import React, { useState } from "react";
import { Button, Group, Modal, Select, Stack } from "@mantine/core";
import LabelingSetsFilter from "./filters/LabelingSetsFilter";
import EmptyDatasetFilter from "./filters/EmptyDatasetsFilter";
import TextSearchFilter from "./filters/TextSearchFilter";

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
  const filtersDef = [
    { displayName: "Empty Datasets", value: "filterEmptyDatasets" },
    { displayName: "Text Search", value: "filterByName" },
    { displayName: "Labeling Sets", value: "labelings" },
  ];

  const [currentFilter, setCurrentFilter] = useState(
    selectedFilter === undefined ? filtersDef[0] : selectedFilter
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
        break;
      case "filterEmptyDatasets":
        return <EmptyDatasetFilter />;
        break;
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
        break;
      default:
        return null;
    }
  };

  const applyAndClose = () => {
    applyFilter(currentFilter, currenFilterParams);
    setFilterModalOpen(false);
  };

  const handleFilterSelect = (filter) => {
    setCurrentFilterParams(undefined);
    setCurrentFilter(filter);
  };

  const _removeFilter = () => {
    removeFilter();
    setFilterModalOpen(false);
  };

  return (
    <div>
      <Modal
        opened={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        size="xl"
        title="Filter Selection"
      >
        <Stack gap="md">
          <Select
            value={currentFilter?.value}
            onChange={(value) => {
              const next = filtersDef.find((f) => f.value === value);
              if (next) {
                handleFilterSelect(next);
              }
            }}
            data={filtersDef.map((filter) => ({
              value: filter.value,
              label: filter.displayName,
            }))}
            allowDeselect={false}
          />
          <div>{renderFilter()}</div>
          <Group justify="flex-end">
            <Button variant="outline" onClick={_removeFilter}>
              Remove filter
            </Button>
            <Button onClick={applyAndClose}>Apply</Button>
            <Button
              color="red"
              variant="outline"
              onClick={() => setFilterModalOpen(false)}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default FilterSelectionModal;
