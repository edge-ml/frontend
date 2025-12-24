import React from "react";
import { Stack, Text, Title } from "@mantine/core";
import { Modal, ModalHeader, ModalFooter, ModalBody } from "../Common/Modal";
import MailSettings from "./MailSettings";
import PasswordSettings from "./PasswordSettings";
import UserNameSettings from "./UserNameSettings";
import DeleteUser from "./DeleteUser";
import UserSettingsProvider from "./UserSettingsProvider";
import useUserStore from "../../Hooks/useUser";
import "../../components/Common/EdgeMLTable/index.css";
import "./UserSettingsModal.css";

const UserSettingsItem = ({ title, description, children }) => {
  return (
    <div className="settings-item">
      <div className="table-header-wrapper settings-item-header">
        <Stack gap={2}>
          <Title order={5}>{title}</Title>
          {description ? (
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          ) : null}
        </Stack>
      </div>
      <div className="table-body-wrapper settings-item-body">{children}</div>
    </div>
  );
};

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
        <Stack gap="md">
          {!user.provider || user.provider === "local" ? (
            <>
              <UserSettingsItem
                title="Change Mail"
                description="Update the email address for your account"
              >
                <MailSettings id="mailSettings" />
              </UserSettingsItem>
              <UserSettingsItem
                title="Change Password"
                description="Set a new password for this account"
              >
                <PasswordSettings id="passwordSettings" />
              </UserSettingsItem>
              <UserSettingsItem
                title="Change Username"
                description="Update your username"
              >
                <UserNameSettings id="userNameSettings" />
              </UserSettingsItem>
            </>
          ) : null}
          <UserSettingsItem
            title="Delete User"
            description="Permanently delete this account"
          >
            <UserSettingsProvider>
              <DeleteUser />
            </UserSettingsProvider>
          </UserSettingsItem>
        </Stack>
      </ModalBody>
      <ModalFooter></ModalFooter>
    </Modal>
  );
};

export default UserSettingsModal;
