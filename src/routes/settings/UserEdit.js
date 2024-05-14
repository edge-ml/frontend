import React, { useContext, useState } from 'react';
import {
  Button,
  Row,
  Col,
  Table,
  InputGroup,
  InputGroupText,
} from 'reactstrap';

import AutoCompleteInput from '../../components/AutoCompleteInput/AutocompleteInput';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { getUserNameSuggestions } from '../../services/ApiServices/AuthentificationServices';
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from '../../components/Common/EdgeMLTable';
import { ProjectContext } from '../../ProjectProvider';
import { AuthContext } from '../../AuthProvider';
import useProjectSettings from '../../Hooks/useProjectSettings';
import useAuth from '../../Hooks/useAuth';
import useUserStore from '../../Hooks/useUser';

const UserEdit = () => {
  const { currentProject } = useContext(ProjectContext);
  const { changeUserNames } = useProjectSettings();
  const { user } = useUserStore();

  const [userSearchValue, setUserSearchValue] = useState('');
  const [userNames, setUserNames] = useState(currentProject.users);

  const onAddUserName = (e) => {
    e.preventDefault();
    setUserNames([...userNames, { userName: e.target.value }]);
    setUserSearchValue('');
  };

  const onChangeUserNameSuggestion = (e) => {
    setUserSearchValue(e.target.value);
  };

  const deleteUserName = (userNameToDelete) => {
    setUserNames(userNames.filter((elm) => elm.userName !== userNameToDelete));
  };

  const usersValid = (users) => {
    return users.every((elm) => elm._id !== user._id);
  };

  return currentProject.users ? (
    <div>
      <InputGroup>
        <InputGroupText>Search user</InputGroupText>
        <AutoCompleteInput
          type="text"
          name="User ID"
          value={userSearchValue}
          placeholder="Enter username"
          onClick={onAddUserName}
          onChange={onChangeUserNameSuggestion}
          getsuggestions={getUserNameSuggestions}
          filter={[
            ...currentProject.users.map((elm) => elm.userName),
            user.userName,
          ]}
        />
      </InputGroup>
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
              size="sm"
              color="danger"
              onClick={() => deleteUserName(user.userName)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </EdgeMLTableEntry>
        ))}
      </EdgeMLTable>
      <div className="pt-3 d-flex justify-content-end">
        <Button
          id="buttonSaveProject"
          color="primary"
          onClick={() => changeUserNames(userNames)}
          disabled={!usersValid(userNames)}
        >
          Save
        </Button>
      </div>
    </div>
  ) : null;
};

export default UserEdit;
