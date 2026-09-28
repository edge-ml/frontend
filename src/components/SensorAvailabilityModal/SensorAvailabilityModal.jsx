import { Modal, Button } from "@mantine/core";

const SensorAvailabilityModal = ({ isOpen, onClose }) => {
  const onGoBack = () => {};

  return (
    <Modal opened={isOpen} size="xl" title="Header" onClose={onClose}>
      <Modal.Body></Modal.Body>
      <Modal.Footer>
        <Button variant="outline" color="blue" onClick={onGoBack}>
          Back
        </Button>
        <Button onClick={onClose} variant="outline" color="red">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SensorAvailabilityModal;
