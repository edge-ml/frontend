import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
  Radio,
  Stack,
} from "@mantine/core";

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

  const handleFilterClick = (event) => {
    setFilterParam(null);
    setCurrentFilter(event.currentTarget.value);
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
      case "filterEmptyDatasets":
        return renderEmptyDatasetsFilter();
      case "filterByLabelingSets":
        return null;
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
      <Modal opened={showFilterSelectionModal} onClose={toggleFilterSelectionModal} size="xl">
        <Modal.Header>
          <Modal.Title>Filter Selection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <Radio.Group
              label="Select a filter:"
              value={currentFilter}
              onChange={(value) => {
                setFilterParam(null);
                setCurrentFilter(value);
              }}
            >
              <Stack>
                {filters.map((filter) => (
                  <Radio
                    key={filter.value}
                    value={filter.value}
                    label={filter.displayName}
                  />
                ))}
              </Stack>
            </Radio.Group>
            {renderFilter()}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" color="blue" onClick={applyAndClose}>
            Apply
          </Button>{" "}
          <Button variant="outline" color="red" onClick={toggleFilterSelectionModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FilterSelectionModal;
