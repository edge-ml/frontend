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
import LabelingSetsFilter from './filters/LabelingSetsFilter';
import EmptyDatasetFilter from './filters/EmptyDatasetsFilter';
import TextSearchFilter from './filters/TextSearchFilter';

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

  const renderFilter = () => {
    switch (currentFilter.value) {
      case 'filterByName':
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
      case 'filterEmptyDatasets':
        return <EmptyDatasetFilter />;
        break;
      case 'labelings':
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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleFilterSelect = (filter) => {
    setCurrentFilterParams(undefined);
    setCurrentFilter(filter);
  };

  const _removeFilter = () => {
    removeFilter();
    setFilterModalOpen(false);
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
          <Button color="primary" outline onClick={_removeFilter}>
            Remove filter
          </Button>{' '}
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