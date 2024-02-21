import { Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap/lib/InputGroup';
import { ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

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

// ConfirmRejectModal.defaultProps = {
//     headerText: "Delete the following entities?",
//     children: []
// }

export default ConfirmRejectModal;
