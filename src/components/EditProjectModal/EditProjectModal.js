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
  Table,
  Col,
  Row,
} from 'reactstrap';

import {
  updateProject,
  createProject,
} from './../../services/ApiServices/ProjectService';

import AutoCompleteInput from '../../components/AutoCompleteInput/AutocompleteInput';
import { getUserNameSuggestions } from '../../services/ApiServices/AuthentificationServices';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import './EditProjectModal.css';

class EditProjectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: undefined,
      userSearchValue: '',
      originalProject: undefined,
      project: undefined,
      originalUsers: [],
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onUserNameChange = this.onUserNameChange.bind(this);
    this.generateTableEntry = this.generateTableEntry.bind(this);
    this.onAddUserName = this.onAddUserName.bind(this);
    this.deleteUserName = this.deleteUserName.bind(this);
    this.onChangeUserNameSuggestion =
      this.onChangeUserNameSuggestion.bind(this);
  }

  onChangeUserNameSuggestion(e) {
    this.setState({
      userSearchValue: e.target.value,
    });
  }

  deleteUserName(userName) {
    const project = this.state.project;
    project.users = project.users.filter((elm) => elm.userName !== userName);
    this.setState({
      project: project,
    });
  }

  onAddUserName(e) {
    e.preventDefault();
    const project = this.state.project;
    project.users.push({ userName: e.target.value });
    this.setState({
      project: project,
      userSearchValue: '',
    });
  }

  onUserNameChange(e, index) {
    e.preventDefault();
    const project = { ...this.state.project };
    project.users[index].userName = e.target.value;
    this.setState({
      project: project,
    });
  }

  onSave() {
    if (this.props.isNewProject) {
      createProject(this.state.project)
        .then((data) => {
          const projectIndex = data.findIndex(
            (elm) => elm.name === this.state.project.name
          );
          this.props.projectChanged(data, projectIndex);
          this.setState({ error: undefined });
        })
        .catch((err) => {
          this.setState({
            error: err,
          });
        });
    } else {
      updateProject(this.state.project)
        .then((data) => {
          this.props.projectChanged(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  componentWillReceiveProps(nextProps) {
    const newProject = { name: '', users: [] };
    this.setState({
      project: newProject,
    });
  }

  onNameChanged(newName) {
    var tmpProject = { ...this.state.project };
    tmpProject.name = newName;
    this.setState({
      project: tmpProject,
    });
  }

  onCancel() {
    this.setState(
      {
        error: undefined,
        originalProject: undefined,
        project: undefined,
        originalUsers: [],
      },
      () => {
        this.props.onClose();
      }
    );
  }

  generateTableEntry(userName, index) {
    return (
      <tr className="table-record" key={userName}>
        <th scope="row" className="table-record-left">
          {index + 1}
        </th>
        <td className="table-record-center">{userName}</td>
        <td className="table-record-right">
          <Button
            className="button-delete-user"
            color="danger"
            size="sm"
            onClick={() => this.deleteUserName(userName)}
          >
            <FontAwesomeIcon className="mr-2" icon={faTrash}></FontAwesomeIcon>
          </Button>
        </td>
      </tr>
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
              placeholder={'Project-name'}
              value={this.state.project.name}
              onChange={(e) => this.onNameChanged(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Admin'}</InputGroupText>
            </InputGroupAddon>
            <Input
              readOnly
              id="inputProjectAdmin"
              placeholder={'Project-admin'}
              value={this.props.userName}
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

          <Row className="user-search-heading">
            <Col className="col-3">Search users: </Col>
            <Col>
              <AutoCompleteInput
                type="text"
                name="User ID"
                value={this.state.userSearchValue}
                placeholder="Enter username"
                onClick={this.onAddUserName}
                onChange={this.onChangeUserNameSuggestion}
                getsuggestions={getUserNameSuggestions}
                filter={[
                  ...this.state.project.users.map((elm) => elm.userName),
                  this.props.userName,
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
            <tbody>
              {this.state.project.users.map((elm, index) =>
                this.generateTableEntry(elm.userName, index)
              )}
            </tbody>
          </Table>
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
