import { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  UncontrolledDropdown,
  FormGroup,
  CustomInput,
  Progress,
  Spinner,
} from 'reactstrap';

import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from '../../components/Common/EdgeMLTable';

const SensorAvailabilityModal = ({ isOpen, onClose }) => {
  const onGoBack = () => {};

  return (
    <Modal isOpen={isOpen} size="xl">
      <ModalHeader>Header</ModalHeader>
      <ModalBody></ModalBody>
      <ModalFooter>
        {page == 1 ? (
          <Button outline color="primary" onClick={onGoBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onClose} outline color="danger">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SensorAvailabilityModal;
