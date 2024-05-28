import React from 'react';
import { Modal, ModalHeader, ModalFooter, ModalBody, Button } from 'reactstrap';
import MailSettings from './MailSettings';
import PasswordSettings from './PasswordSettings';
import UserNameSettings from './UserNameSettings';
import DeleteUser from './DeleteUser';
import UserSettingsProvider from './UserSettingsProvider';

const UserSettingsModal = (props) => {
  return (
    <Modal size="lg" isOpen={props.isOpen} className="modal-dialog-scrollable">
      <ModalHeader style={{ borderBottom: 'None' }}>User Settings</ModalHeader>
      <ModalBody style={{ maxHeight: 'calc(100vh)', overflowY: 'auto' }}>
        <MailSettings id="mailSettings" />
        <hr />
        <PasswordSettings id="passwordSettings" />
        <hr />
        <UserNameSettings id="userNameSettings" />
        <hr />
        <UserSettingsProvider onLogout={props.onLogout}>
          <DeleteUser userMail={props.userMail} />
        </UserSettingsProvider>
      </ModalBody>
      <ModalFooter>
        <Button
          id="buttonCloseSettings"
          color="secondary"
          className="m-1"
          onClick={props.onClose}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UserSettingsModal;
