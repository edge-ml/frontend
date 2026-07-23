import React, { useState } from "react";
import { Button, Group, ActionIcon, Table } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import AutoCompleteInput from "../../components/AutoCompleteInput/AutocompleteInput";
import { getUserNameSuggestions } from "../../services/ApiServices/AuthentificationServices";
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
    setUserNames(userNames.filter((u) => u.userName !== userNameToDelete));
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
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>#</Table.Th>
              <Table.Th>Users in the project</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {userNames.map((u, index) => (
              <Table.Tr key={index}>
                <Table.Td>{index + 1}</Table.Td>
                <Table.Td>{u.userName}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDeleteUserName(u.userName)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
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
