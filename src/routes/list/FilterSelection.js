import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  FormGroup,
} from 'reactstrap';

const FilterSelectionModal = ({
  filterModalOpen,
  setFilterModalOpen,
  applyFilter,
  filters,
  setFilters,
}) => {
  const [currentFilter, setCurrentFilter] = useState(selectedFilter);
  const [filterParam, setFilterParam] = useState(null);
  const filtersDef = [
    { displayName: 'Remove Filter', value: 'clearFilter' },
    { displayName: 'Text Search', value: 'filterByName' },
    { displayName: 'Empty Datasets', value: 'filterEmptyDatasets' },
    { displayName: 'Labeling Sets', value: 'labelings' },
  ];

  const handleFilterClick = (event) => {
    setFilterParam(null);
    setCurrentFilter(event.target.value);
  };

  const renderEmptyDatasetsFilter = () => {
    return (
      <div>This filter marks all datasets that contain no timeseries.</div>
    );
  };

  const renderFilter = () => {
    switch (currentFilter) {
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
    setFilters(currentFilter, filterParam);
    applyFilter(currentFilter, filterParam);
    setFilterModalOpen(false);
  };

  /**  return (
    <div>
      <Modal isOpen={filterModalOpen} size="xl">
        <ModalHeader>Filter Selection</ModalHeader>
        <ModalBody>
          <div>
            <FormGroup className="ml-3 d-flex flex-column justify-content-center">
              <Label>Select a filter:</Label>
              {c.map((filter, idx) => (
                <div key={idx}>
                  <Label check>
                    <Input
                      type="radio"
                      name="radioOption"
                      value={filter.value}
                      checked={currentFilter === filter.value}
                      onChange={handleFilterClick}
                    />{' '}
                    {filter.displayName}
                  </Label>
                </div>
              ))}
            </FormGroup>
            {renderFilter()}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" outline onClick={applyAndClose}>
            Apply
          </Button>{' '}
          <Button color="danger" outline onClick={() => setFilterModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );*/

  /**  return (
    <Dropdown
      direction="left"
      isOpen={sortDropDownIsOpen}
      toggle={toggleDropdown}
      size="sm"
      className="dataset-sorting"
    >
      <DropdownToggle caret>
        {sortingText || <FontAwesomeIcon icon={faSort} />}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Filter Selection</DropdownItem>
        <DropdownItem onClick={handleItemClick} data-dropdownvalue="alphaDesc">
          Alphabetical (descending)
        </DropdownItem>
        <DropdownItem onClick={handleItemClick} data-dropdownvalue="alphaAsc">
          Alphabetical (ascending)
        </DropdownItem>
        <DropdownItem onClick={handleItemClick} data-dropdownvalue="dateDesc">
          Recording Date (descending)
        </DropdownItem>
        <DropdownItem onClick={handleItemClick} data-dropdownvalue="dateAsc">
          Recording Date (ascending)
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};*/

  return (
    <div>
      <Modal isOpen={filterModalOpen} size="xl">
        <ModalHeader>Filter Selection</ModalHeader>
        <ModalBody>
          <div></div>
          {renderFilter()}
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
