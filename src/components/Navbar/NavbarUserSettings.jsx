import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import "./Navbar.css";
import { Box, Button, Group, Popover, Stack, Text } from "@mantine/core";
import { AuthContext } from "../../AuthProvider";
import UserSettingsModal from "../UserSettingsModal/UserSettingsModal";
import useAuth from "../../Hooks/useAuth";
import useUserStore from "../../Hooks/useUser";

const NavbarUserSettings = () => {
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [userSettingsModalOpen, setUserSettingsModalOpen] = useState(false);

  const { logout } = useAuth();
  const { user } = useUserStore();

  const toggleUserPopOver = () => {
    setUserPopoverOpen(!userPopoverOpen);
  };

  const toggleUserSettingsModal = () => {
    setUserSettingsModalOpen(!userSettingsModalOpen);
  };

  return (
    <>
      <Popover
        opened={userPopoverOpen}
        onChange={setUserPopoverOpen}
        position="right"
      >
        <Popover.Target>
          <Group
            id="userProfileSettings"
            className="navbar-project-item"
            justify="center"
            align="center"
            gap="xs"
            py="md"
            onClick={toggleUserPopOver}
          >
            <Group
              justify="center"
              align="center"
              style={{
                backgroundColor: "lightgray",
                border: "0px solid darkgray",
                width: "26px",
                height: "26px",
                borderRadius: "13px",
                overflow: "hidden",
              }}
            >
              <FontAwesomeIcon
                icon={faUser}
                style={{ fontSize: "x-large", color: "white" }}
              />
            </Group>
            <Text>{user?.userName || user?.username || user?.email || "User"}</Text>
          </Group>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack align="stretch" gap="sm">
            <Button
              fullWidth
              variant="outline"
              color="blue"
              onClick={toggleUserSettingsModal}
            >
              Settings
            </Button>
            <Button fullWidth variant="outline" color="red" onClick={logout}>
              Logout
            </Button>
          </Stack>
        </Popover.Dropdown>
      </Popover>
      <UserSettingsModal
        isOpen={userSettingsModalOpen}
        onClose={toggleUserSettingsModal}
      ></UserSettingsModal>
    </>
  );
};

export default NavbarUserSettings;
