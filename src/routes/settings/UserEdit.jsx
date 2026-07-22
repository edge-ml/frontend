import React, { useState } from "react";
import { Button, Group, ActionIcon } from "@mantine/core";
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
  const { changeUserNames } = useProjectSettings();
  const { user } = useUserStore();

  const [userSearchValue, setUserSearchValue] = useState("");
  const [userNames, setUserNames] = useState(currentProject.users);

  const handleAddUserName = (e) => {
    e.preventDefault();
    setUserNames([...userNames, { userName: e.target.value }]);
    setUserSearchValue("");
  };

  const handleUserNameSuggestionChange = (e) => {
    setUserSearchValue(e.currentTarget.value);
  };

  const handleDeleteUserName = (userNameToDelete) => {
    setUserNames(
      userNames.filter((u) => u.userName !== userNameToDelete)
    );
  };

  const areUsersValid = () => true;

  if (!currentProject.users) return null;

  return (
    <div>
      <Group gap="sm" mb="md">
        <AutoCompleteInput
          name="User ID"
          value={userSearchValue}
          placeholder="Enter username"
          onClick={handleAddUserName}
          onChange={handleUserNameSuggestionChange}
          getsuggestions={getUserNameSuggestions}
          filter={[
            ...currentProject.users.map((u) => u.userName),
            user.userName,
          ]}
        />
      </Group>
      {userNames.length > 0 && (
        <EdgeMLTable>
          <EdgeMLTableHeader>Users in the project</EdgeMLTableHeader>
          {userNames.map((u, index) => (
            <EdgeMLTableEntry
              key={index}
              className="d-flex justify-content-between p-2 align-items-center"
            >
              <div>{index + 1}</div>
              <div>{u.userName}</div>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => handleDeleteUserName(u.userName)}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </ActionIcon>
            </EdgeMLTableEntry>
          ))}
        </EdgeMLTable>
      )}
      <Group justify="flex-end" mt="md">
        <Button
          variant="outline"
          onClick={() => changeUserNames(userNames)}
          disabled={!areUsersValid()}
        >
          Save
        </Button>
      </Group>
    </div>
  );
};

export default UserEdit;
