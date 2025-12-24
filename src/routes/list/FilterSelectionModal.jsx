import React, { useState } from "react";
import { Button, Group, Modal, Radio, Stack, Text } from "@mantine/core";

const FilterSelectionModal = ({
  toggleFilterSelectionModal,
  showFilterSelectionModal,
  applyFilter,
  selectedFilter,
  setSelectedFilter,
}) => {
  const [currentFilter, setCurrentFilter] = useState(selectedFilter);
  const [filterParam, setFilterParam] = useState(null);
  const filters = [
    { displayName: "Remove Filter", value: "clearFilter" },
    { displayName: "Text Search", value: "filterByName" },
    { displayName: "Empty Datasets", value: "filterEmptyDatasets" },
    { displayName: "Labeling Sets", value: "filterByLabelingSets" },
  ];

  const handleFilterClick = (value) => {
    setFilterParam(null);
    setCurrentFilter(value);
  };

  const renderEmptyDatasetsFilter = () => {
    return (
      <div>This filter marks all datasets that contain no timeseries.</div>
    );
  };

  const renderFilter = () => {
    switch (currentFilter) {
      case "filterByName":
        return null;
        break;
      case "filterEmptyDatasets":
        return renderEmptyDatasetsFilter();
        break;
      case "filterByLabelingSets":
        return null;
        break;
      default:
        return null;
    }
  };

  const applyAndClose = () => {
    setFilterParam(filterParam);
    setSelectedFilter(currentFilter);
    applyFilter(currentFilter, filterParam);
    toggleFilterSelectionModal();
  };

  return (
    <div>
      <Modal
        opened={showFilterSelectionModal}
        onClose={toggleFilterSelectionModal}
        size="xl"
        title="Filter Selection"
      >
        <Stack gap="md">
          <div>
            <Text fw={600}>Select a filter:</Text>
            <Radio.Group value={currentFilter} onChange={handleFilterClick}>
              <Stack gap="xs" mt="xs">
                {filters.map((filter) => (
                  <Radio
                    key={filter.value}
                    value={filter.value}
                    label={filter.displayName}
                  />
                ))}
              </Stack>
            </Radio.Group>
          </div>
          {renderFilter()}
          <Group justify="flex-end">
            <Button variant="outline" onClick={applyAndClose}>
              Apply
            </Button>
            <Button color="red" variant="outline" onClick={toggleFilterSelectionModal}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default FilterSelectionModal;
