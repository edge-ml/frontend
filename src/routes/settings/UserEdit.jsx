import React, { useState } from 'react';
import {
  Button,
  InputGroup,
  InputGroupText,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import AutoCompleteInput from '../../components/AutoCompleteInput/AutocompleteInput';
import { getUserNameSuggestions } from '../../services/ApiServices/AuthentificationServices';
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from '../../components/Common/EdgeMLTable';
import useProjectSettings from '../../Hooks/useProjectSettings';
import useUserStore from '../../Hooks/useUser';
import useProjectStore from '../../stores/projectStore';

const UserEdit = () => {
  const { currentProject } = useProjectStore();
  const { changeUserNames } = useProjectSettings();
  const { user } = useUserStore();

  const [userSearchValue, setUserSearchValue] = useState('');
  const [userNames, setUserNames] = useState(currentProject.users);

  const handleAddUserName = (e) => {
    e.preventDefault();
    setUserNames([...userNames, { userName: e.target.value }]);
    setUserSearchValue('');
  };

  const handleUserNameSuggestionChange = (e) => {
    setUserSearchValue(e.target.value);
  };

  const handleDeleteUserName = (userNameToDelete) => {
    setUserNames(userNames.filter((user) => user.userName !== userNameToDelete));
  };

  const areUsersValid = (users) => {
    return users.every((user) => user._id !== user._id);
  };

  if (!currentProject.users) {
    return null;
  }

  console.log(userNames);

  return (
    <div>
      <InputGroup className="w-100">
        <InputGroupText>Search user</InputGroupText>
        <AutoCompleteInput
          type="text"
          name="User ID"
          value={userSearchValue}
          placeholder="Enter username"
          onClick={handleAddUserName}
          onChange={handleUserNameSuggestionChange}
          getsuggestions={getUserNameSuggestions}
          filter={[
            ...currentProject.users.map((user) => user.userName),
            user.userName,
          ]}
        />
      </InputGroup>
      {userNames.length > 0 ? (
      <EdgeMLTable>
        <EdgeMLTableHeader>Users in the project</EdgeMLTableHeader>
        {userNames.map((user, index) => (
          <EdgeMLTableEntry
            key={index}
            className="d-flex justify-content-between p-2 align-items-center"
          >
            <div>{index + 1}</div>
            <div>{user.userName}</div>
            <Button
              outline
              size="sm"
              color="danger"
              onClick={() => handleDeleteUserName(user.userName)}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
          </EdgeMLTableEntry>
        ))}
      </EdgeMLTable>) : null}
      <div className="pt-3 d-flex justify-content-end">
        <Button
          outline
          id="buttonSaveProject"
          color="primary"
          onClick={() => changeUserNames(userNames)}
          disabled={!areUsersValid(userNames)}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default UserEdit;
