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
  toggleFilterSelectionModal,
  showFilterSelectionModal,
  applyFilter,
  selectedFilter,
  setSelectedFilter,
}) => {
  const [currentFilter, setCurrentFilter] = useState(selectedFilter);
  const [filterParam, setFilterParam] = useState(null);
  const filters = [
    { displayName: 'Remove Filter', value: 'clearFilter' },
    { displayName: 'Text Search', value: 'filterByName' },
    { displayName: 'Empty Datasets', value: 'filterEmptyDatasets' },
    { displayName: 'Labeling Sets', value: 'filterByLabelingSets' },
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
      case 'filterByLabelingSets':
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
      <Modal isOpen={showFilterSelectionModal} size="xl">
        <ModalHeader>Filter Selection</ModalHeader>
        <ModalBody>
          <div>
            <FormGroup className="ml-3 d-flex flex-column justify-content-center">
              <Label>Select a filter:</Label>
              {filters.map((filter) => (
                <div key={filter.value}>
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
          <Button color="danger" outline onClick={toggleFilterSelectionModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default FilterSelectionModal;
