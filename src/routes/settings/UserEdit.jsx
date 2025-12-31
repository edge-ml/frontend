import React, { useMemo, useState } from "react";
import { Badge, Button, Group, Stack, Text } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import AutoCompleteInput from "../../components/AutoCompleteInput/AutocompleteInput";
import { getUserNameSuggestions } from "../../services/ApiServices/AuthentificationServices";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../../components/Common/EdgeMLTable";
import useProjectSettings from "../../Hooks/useProjectSettings";
import useUserStore from "../../Hooks/useUser";
import useProjectStore from "../../stores/projectStore";

const UserEdit = () => {
  const { currentProject } = useProjectStore();
  const { addProjectUser, removeProjectUser } = useProjectSettings();
  const { user } = useUserStore();

  const [userSearchValue, setUserSearchValue] = useState("");
  const projectUsers = useMemo(
    () => currentProject.users || [],
    [currentProject.users]
  );
  const adminUserName =
    currentProject.admin?.userName ?? currentProject.admin?.username;
  const isProjectAdmin = user?.id === currentProject.admin?.id;

  const handleAddUserName = async (nextUserName) => {
    if (!nextUserName) {
      return;
    }
    if (
      projectUsers.some(
        (existing) =>
          (existing.userName ?? existing.username) === nextUserName
      )
    ) {
      setUserSearchValue("");
      return;
    }
    try {
      await addProjectUser(nextUserName);
      setUserSearchValue("");
    } catch {
      setUserSearchValue("");
    }
  };

  const handleUserNameSuggestionChange = (e) => {
    setUserSearchValue(e.target.value);
  };

  const handleDeleteUserName = async (userNameToDelete) => {
    try {
      await removeProjectUser(userNameToDelete);
    } catch {
      // no-op: backend enforces permissions, keep UI unchanged on error
    }
  };

  if (!currentProject.users) {
    return null;
  }

  return (
    <div>
      <Stack gap="md">
        <Group align="center">
          <Text fw={600}>Project owner:</Text>
          <Text>
            {currentProject.admin?.userName}
            {currentProject.admin?.email
              ? ` (${currentProject.admin.email})`
              : ""}
          </Text>
          <Badge color="blue" variant="light">
            Owner
          </Badge>
        </Group>
        <Group align="flex-end" wrap="nowrap" className="w-100">
          <div style={{ minWidth: 120 }}>
            <Text fw={600}>Search user</Text>
          </div>
          <AutoCompleteInput
            type="text"
            name="User ID"
            value={userSearchValue}
            placeholder="Enter username"
            onClick={(e) => handleAddUserName(e.target.value)}
            onChange={handleUserNameSuggestionChange}
            getsuggestions={getUserNameSuggestions}
            filter={[
              ...currentProject.users.map(
                (user) => user.userName ?? user.username
              ),
              user.userName,
            ]}
            disabled={!isProjectAdmin}
          />
          <Button
            id="buttonSaveProject"
            onClick={() => handleAddUserName(userSearchValue)}
            disabled={!userSearchValue || !isProjectAdmin}
          >
            Save
          </Button>
        </Group>
        {projectUsers.length > 0 ? (
          <EdgeMLTable>
            <EdgeMLTableHeader>Users in the project</EdgeMLTableHeader>
            {projectUsers.map((user, index) => {
              const userName = user.userName ?? user.username;
              const isAdmin = userName === adminUserName;
              return (
              <EdgeMLTableEntry
                key={index}
                className="d-flex justify-content-between p-2 align-items-center"
              >
                <div>{index + 1}</div>
                <div>{userName}</div>
                <div>{user.email ? ` (${user.email})` : ""}</div>
                <Button
                  variant="outline"
                  size="xs"
                  color="red"
                  onClick={() => handleDeleteUserName(userName)}
                  disabled={isAdmin || !isProjectAdmin}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </Button>
              </EdgeMLTableEntry>
            )})}
          </EdgeMLTable>
        ) : null}
      </Stack>
    </div>
  );
};

export default UserEdit;
