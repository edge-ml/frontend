import { ModalBody, ModalFooter, ModalHeader, Modal, Button } from 'reactstrap';

const ConfirmRejectModal = ({ headerText, onConfrim, onReject, children }) => {
  return (
    <Modal isOpen={true}>
      <ModalHeader>{headerText}</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button onClick={onReject}>Reject</Button>
        <Button onClick={onConfrim}>Confirm</Button>
      </ModalFooter>
    </Modal>
  );
};


export default ConfirmRejectModal;
