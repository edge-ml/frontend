import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

const FilterSelectionModal = ({
  filterModalOpen,
  setFilterModalOpen,
  applyFilter,
  selectedFilter,
  setSelectedFilter,
  selectedFilterParams,
  setSelectedFilterParams,
}) => {
  const filtersDef = [
    { displayName: 'Empty Datasets', value: 'filterEmptyDatasets' },
    { displayName: 'Text Search', value: 'filterByName' },
    { displayName: 'Labeling Sets', value: 'labelings' },
  ];

  const [currentFilter, setCurrentFilter] = useState(
    selectedFilter === undefined ? filtersDef[0] : selectedFilter
  );
  const [currenFilterParams, setCurrentFilterParams] =
    useState(selectedFilterParams);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const renderEmptyDatasetsFilter = () => {
    return (
      <div>This filter shows all datasets that contain no timeseries.</div>
    );
  };

  const renderFilter = () => {
    switch (currentFilter.value) {
      case 'filterByName':
        return null;
        break;
      case 'filterEmptyDatasets':
        return renderEmptyDatasetsFilter();
        break;
      case 'labelings':
        return null;
        break;
      default:
        return null;
    }
  };

  const applyAndClose = () => {
    setSelectedFilter(currentFilter);
    setSelectedFilterParams(currenFilterParams);
    applyFilter(currentFilter, currenFilterParams);
    setFilterModalOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleFilterSelect = (filter) => {
    setCurrentFilter(filter);
    setCurrentFilterParams(undefined);
  };

  const filterDropdown = () => {
    return (
      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
        <DropdownToggle caret>{currentFilter.displayName}</DropdownToggle>
        <DropdownMenu>
          {filtersDef.map((filter) => (
            <DropdownItem
              key={filter.value}
              onClick={() => handleFilterSelect(filter)}
            >
              {filter.displayName}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  };

  return (
    <div>
      <Modal isOpen={filterModalOpen} size="xl">
        <ModalHeader>Filter Selection</ModalHeader>
        <ModalBody>
          <div>
            <div>{filterDropdown()}</div>
            <div>{renderFilter()}</div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" outline onClick={applyAndClose}>
            Apply
          </Button>{' '}
          <Button
            color="danger"
            outline
            onClick={() => setFilterModalOpen(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default FilterSelectionModal;
