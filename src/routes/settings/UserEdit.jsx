import React, { useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
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
  const { addProjectUser } = useProjectSettings();
  const { user } = useUserStore();

  const [userSearchValue, setUserSearchValue] = useState("");
  const [users, setUsers] = useState(currentProject.users);

  const handleAddUserName = async (nextUserName) => {
    if (!nextUserName) {
      return;
    }
    if (users.some((existing) => existing.userName === nextUserName)) {
      setUserSearchValue("");
      return;
    }
    try {
      await addProjectUser(nextUserName);
      setUsers([...users, { userName: nextUserName }]);
      setUserSearchValue("");
    } catch {
      setUserSearchValue("");
    }
  };

  const handleUserNameSuggestionChange = (e) => {
    setUserSearchValue(e.target.value);
  };

  const handleDeleteUserName = (userNameToDelete) => {
    setUsers(users.filter((user) => user.userName !== userNameToDelete));
  };

  if (!currentProject.users) {
    return null;
  }

  return (
    <div>
      <Stack gap="md">
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
              ...currentProject.users.map((user) => user.userName),
              user.userName,
            ]}
          />
          <Button
            id="buttonSaveProject"
            onClick={() => handleAddUserName(userSearchValue)}
            disabled={!userSearchValue}
          >
            Save
          </Button>
        </Group>
        {users.length > 0 ? (
          <EdgeMLTable>
            <EdgeMLTableHeader>Users in the project</EdgeMLTableHeader>
            {users.map((user, index) => (
              <EdgeMLTableEntry
                key={index}
                className="d-flex justify-content-between p-2 align-items-center"
              >
                <div>{index + 1}</div>
                <div> {user.username}</div>
                <div>{user.email ? ` (${user.email})` : ""}</div>
                <Button
                  variant="outline"
                  size="xs"
                  color="red"
                  onClick={() => handleDeleteUserName(user.userName)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </Button>
              </EdgeMLTableEntry>
            ))}
          </EdgeMLTable>
        ) : null}
      </Stack>
    </div>
  );
};

export default UserEdit;
