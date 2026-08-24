import React from "react";
import { Modal, ModalHeader, ModalBody } from "../Common/Modal";
import MailSettings from "./MailSettings";
import PasswordSettings from "./PasswordSettings";
import UserNameSettings from "./UserNameSettings";
import DeleteUser from "./DeleteUser";
import UserSettingsProvider from "./UserSettingsProvider";
import useUserStore from "../../Hooks/useUser";

import "./UserSettingsModal.css";

const UserSettingsModal = ({ isOpen, onClose }) => {
  const user = useUserStore((state) => state.user);
  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      classNames={{ content: "user-settings-modal" }}
    >
      <ModalHeader>User settings</ModalHeader>
      <ModalBody className="user-settings-modal__body">
        <div className="user-settings-sections">
          {!user.provider || user.provider === "local" ? (
            <>
              <MailSettings id="mailSettings" />
              <PasswordSettings id="passwordSettings" />
              <UserNameSettings id="userNameSettings" />
            </>
          ) : null}
          <UserSettingsProvider>
            <DeleteUser />
          </UserSettingsProvider>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default UserSettingsModal;
