import React, { useContext, useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InputGroup,
  InputGroupText,
  Input,
  Table,
  Col,
  Row,
} from 'reactstrap';

import useCreateProject from '../../Hooks/useCreateProject';
import AutoCompleteInput from '../../components/AutoCompleteInput/AutocompleteInput';
import { getUserNameSuggestions } from '../../services/ApiServices/AuthentificationServices';

import './EditProjectModal.css';
import { AuthContext } from '../../AuthProvider';
import useAuth from '../../Hooks/useAuth';
import useUserStore from '../../Hooks/useUser';

const EditProjectModal = ({ isOpen, onClose }) => {
  const [userSearchValue, setUserSearchValue] = useState('');
  const { user } = useUserStore();

  const { project, setProjectName, createProject, addUser, removeUser } =
    useCreateProject();

  console.log(project);
  return (
    <Modal id="editProjectModal" isOpen={isOpen}>
      <ModalHeader>Create new Project</ModalHeader>
      <ModalBody>
        <InputGroup>
          <InputGroupText>
            <InputGroupText>{'Name'}</InputGroupText>
          </InputGroupText>
          <Input
            id="inputProjectName"
            placeholder={'Project-name'}
            value={project.name}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </InputGroup>
        <InputGroup>
          <InputGroupText>
            <InputGroupText>{'Admin'}</InputGroupText>
          </InputGroupText>
          <Input
            readOnly
            id="inputProjectAdmin"
            placeholder={'Project-admin'}
            value={project.admin.name + ' (' + project.admin.mail + ')'}
          />
        </InputGroup>
        <h5 style={{ paddingTop: '16px' }}>Users</h5>
        <Row className="user-search-heading">
          <Col className="col-3">Search users: </Col>
          <Col>
            <AutoCompleteInput
              type="text"
              name="User ID"
              value={userSearchValue}
              placeholder="Enter username"
              onClick={addUser}
              onChange={(e) => setUserSearchValue(e.target.value)}
              getsuggestions={getUserNameSuggestions}
              filter={[
                ...project.users.map((elm) => elm.userName),
                project.admin.name,
              ]}
            ></AutoCompleteInput>
          </Col>
        </Row>
        <Table striped>
          <thead>
            <tr className="table-record">
              <th className="table-record-left">#</th>
              <th className="table-record-center">UserName</th>
              <th className="table-record-right">Delete</th>
            </tr>
          </thead>
          {/* <tbody>
                        {this.state.project.users.map((elm, index) =>
                            this.generateTableEntry(elm.userName, index),
                        )}
                    </tbody> */}
        </Table>
      </ModalBody>
      <ModalFooter style={{ justifyContent: 'space-between' }}>
        <Button
          id="btnSaveProject"
          color="primary"
          className="m-1"
          onClick={async () => {
            await createProject();
            onClose();
          }}
        >
          Save
        </Button>{' '}
        {/* <div className="error-text"> {this.state.error}</div> */}
        <Button
          id="btnSaveProjectCancel"
          color="secondary"
          className="m-1"
          onClick={onClose}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditProjectModal;
