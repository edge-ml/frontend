import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ListGroup,
  ListGroupItem,
  Label,
  FormGroup,
} from 'reactstrap';

const FilterSelectionModal = ({
  toggleFilterSelectionModal,
  showFilterSelectionModal,
}) => {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const filters = [
    { displayName: 'Name Prefix', value: 'filterByName' },
    { displayName: 'Empty Datasets', value: 'filterEmptyDatasets' },
    { displayName: 'Labeling Sets', value: 'filterByLabelingSets' },
  ];

  const handleFilterClick = (event) => {
    setSelectedFilter(event.target.value);
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
                      checked={selectedFilter === filter.value}
                      onChange={handleFilterClick}
                    />{' '}
                    {filter.displayName}
                  </Label>
                </div>
              ))}
            </FormGroup>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" outline onClick={toggleFilterSelectionModal}>
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
