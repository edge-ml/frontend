import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';


const DeleteModal = ({ isOpen, children, onCancel, onDelete }) => {
    return (
        <Modal isOpen={isOpen}>
            <ModalHeader>Are you sure to delete:</ModalHeader>
            <ModalBody>{children}</ModalBody>
            <ModalFooter className='d-flex justify-content-between'>
                <Button outline color='secondary' onClick={onCancel}>Cancel</Button>
                <Button outline color='danger' onClick={onDelete}>Delete</Button>
            </ModalFooter>
        </Modal>
    )
}

export default DeleteModal;