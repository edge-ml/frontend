import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  Popover,
  Button,
  Stack,
  Avatar,
  Text,
  UnstyledButton,
} from "@mantine/core";

import "./Navbar.css";
import useAuth from "../../Hooks/useAuth";
import useUserStore from "../../Hooks/useUser";
import UserSettingsModal from "../UserSettingsModal/UserSettingsModal";

const NavbarUserSettings = () => {
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [userSettingsModalOpen, setUserSettingsModalOpen] = useState(false);

  const { logout } = useAuth();
  const { user } = useUserStore();

  return (
    <>
      <Popover
        opened={userPopoverOpen}
        onChange={setUserPopoverOpen}
        position="right"
        withArrow
      >
        <Popover.Target>
          <UnstyledButton
            className="d-flex justify-content-center align-items-center pt-3 pb-3 w-100"
            onClick={() => setUserPopoverOpen((o) => !o)}
            style={{ color: "#666", cursor: "pointer" }}
          >
            <Avatar size="sm" radius="xl" color="gray" mr={8}>
              <FontAwesomeIcon icon={faUser} />
            </Avatar>
            <Text size="sm">{user?.userName}</Text>
          </UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="xs" align="stretch">
            <Button
              variant="outline"
              onClick={() => {
                setUserSettingsModalOpen(true);
                setUserPopoverOpen(false);
              }}
            >
              Settings
            </Button>
            <Button variant="outline" color="red" onClick={logout}>
              Logout
            </Button>
          </Stack>
        </Popover.Dropdown>
      </Popover>

      <UserSettingsModal
        isOpen={userSettingsModalOpen}
        onClose={() => setUserSettingsModalOpen(false)}
      />
    </>
  );
};

export default NavbarUserSettings;
