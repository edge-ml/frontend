import React from "react";
import { Modal, ModalHeader, ModalFooter, ModalBody } from "../Common/Modal";
import MailSettings from "./MailSettings";
import PasswordSettings from "./PasswordSettings";
import UserNameSettings from "./UserNameSettings";
import DeleteUser from "./DeleteUser";
import UserSettingsProvider from "./UserSettingsProvider";
import useUserStore from "../../Hooks/useUser";

const UserSettingsModal = ({ isOpen, onClose }) => {
  const user = useUserStore((state) => state.user);
  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      className="modal-dialog-scrollable"
    >
      <ModalHeader style={{ borderBottom: "None" }}>User Settings</ModalHeader>
      <ModalBody style={{ maxHeight: "calc(100vh)", overflowY: "auto" }}>
        {!user.provider || user.provider === "local" ? (
          <>
            <MailSettings id="mailSettings" />
            <hr />
            <PasswordSettings id="passwordSettings" />
            <hr />
            <UserNameSettings id="userNameSettings" />
            <hr />
          </>
        ) : null}
        <UserSettingsProvider>
          <DeleteUser />
        </UserSettingsProvider>
      </ModalBody>
      <ModalFooter></ModalFooter>
    </Modal>
  );
};

export default UserSettingsModal;
