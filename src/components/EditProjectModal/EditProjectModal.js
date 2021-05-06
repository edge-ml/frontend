import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Table
} from 'reactstrap';

import {
  updateProject,
  createProject
} from './../../services/ApiServices/ProjectService';

import AutoCompleteInput from '../../components/AutoCompleteInput/AutocompleteInput';
import { getUserNameSuggestions } from '../../services/ApiServices/AuthentificationServices';

class EditProjectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: undefined,
      originalProject: undefined,
      project: undefined,
      originalUsers: []
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onAddUser = this.onAddUser.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onUserNameChange = this.onUserNameChange.bind(this);
  }

  onUserNameChange(e, index) {
    e.preventDefault();
    const project = { ...this.state.project };
    project.users[index].userName = e.target.value;
    this.setState({
      project: project
    });
  }

  onDeleteUser(user) {
    var idx = this.state.originalUsers.findIndex(elm => elm === user);
    var tmpOriginalUsers = [...this.state.originalUsers];
    if (idx !== -1) {
      tmpOriginalUsers.splice(idx, 1);
    }
    var tmpProject = { ...this.state.project };
    var idxPrj = tmpProject.users.findIndex(elm => elm === user);
    tmpProject.users.splice(idxPrj, 1);
    this.setState({
      originalUsers: tmpOriginalUsers,
      project: tmpProject
    });
  }

  onSave() {
    if (this.props.isNewProject) {
      createProject(this.state.project)
        .then(data => {
          const projectIndex = data.findIndex(
            elm => elm.name === this.state.project.name
          );
          this.props.projectChanged(data, projectIndex);
        })
        .catch(err => {
          this.setState({
            error: err
          });
        });
    } else {
      updateProject(this.state.project)
        .then(data => {
          this.props.projectChanged(data);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  componentWillReceiveProps(nextProps) {
    const newProject = { name: '', users: [] };
    this.setState({
      project: newProject
    });
  }

  onNameChanged(newName) {
    var tmpProject = { ...this.state.project };
    tmpProject.name = newName;
    this.setState({
      project: tmpProject
    });
  }

  onAddUser() {
    var tmpProject = { ...this.state.project };
    tmpProject.users.push({ _id: undefined, userName: '' });
    this.setState({
      project: tmpProject
    });
  }

  onCancel() {
    this.setState(
      {
        error: undefined,
        originalProject: undefined,
        project: undefined,
        originalUsers: []
      },
      () => {
        this.props.onClose();
      }
    );
  }

  render() {
    if (
      !this.state.project ||
      !this.state.project.users ||
      !this.props.isNewProject
    )
      return null;
    return (
      <Modal id="editProjectModal" isOpen={this.props.isOpen}>
        <ModalHeader>
          {this.props.isNewProject
            ? 'Create new Project'
            : 'Edit Project: ' + this.state.originalProject.name}
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Name'}</InputGroupText>
            </InputGroupAddon>
            <Input
              id="inputProjectName"
              placeholder={'Name'}
              value={this.state.project.name}
              onChange={e => this.onNameChanged(e.target.value)}
            />
          </InputGroup>
          {this.props.isNewProject ? null : (
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>{'Admin'}</InputGroupText>
              </InputGroupAddon>
              <Input value={this.state.project.admin.userName} readOnly />
            </InputGroup>
          )}
          <h5 style={{ paddingTop: '16px' }}>Users</h5>
          <Table striped>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.state.project.users.map((user, index) => {
                return (
                  <tr key={user._id + index}>
                    <th scope="row">{index}</th>
                    <td>
                      {this.state.originalUsers
                        .map(elm => elm._id)
                        .includes(user._id) && user._id !== '' ? (
                        user.userName
                      ) : (
                        <AutoCompleteInput
                          type="text"
                          name="User ID"
                          placeholder="Enter username"
                          onChange={e => this.onUserNameChange(e, index)}
                          value={user.userName}
                          getSuggestions={getUserNameSuggestions}
                          filter={[
                            ...this.state.project.users.map(
                              elm => elm.userName
                            ),
                            this.props.userName
                          ]}
                        ></AutoCompleteInput>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        className="btn-sm"
                        color="danger"
                        onClick={() => this.onDeleteUser(user._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Button
            id="btnAddUser"
            color="primary"
            className="btn-sm"
            onClick={this.onAddUser}
          >
            Add +
          </Button>
        </ModalBody>
        <ModalFooter style={{ justifyContent: 'space-between' }}>
          <Button
            id="btnSaveProject"
            color="primary"
            className="m-1"
            onClick={this.onSave}
          >
            Save
          </Button>{' '}
          <div className="error-text"> {this.state.error}</div>
          <Button
            id="btnSaveProjectCancel"
            color="secondary"
            className="m-1"
            onClick={this.onCancel}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default EditProjectModal;
