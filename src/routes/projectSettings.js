import React, { Component } from 'react';
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Table,
  CustomInput,
  Col,
  Row
} from 'reactstrap';

import { Prompt, withRouter } from 'react-router-dom';

import {
  deleteProject,
  updateProject
} from './../services/ApiServices/ProjectService';
import {
  switchDeviceApiActive,
  getDeviceApiKey,
  setDeviceApiKey,
  deleteDeviceApiKey
} from '../services/ApiServices/DeviceApiService';
import { API_URI } from './../services/ApiServices/ApiConstants';

import NoProjectPage from './../components/NoProjectPage/NoProjectPage';
import { getUserNameSuggestions } from '../services/ApiServices/AuthentificationServices';
import CodeSnippetModal from '../components/ApiSnippetsModal/CodeSnippetModal';
import { FormGroup } from 'react-bootstrap';
import AutoCompleteInput from '../components/AutoCompleteInput/AutocompleteInput';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
class ProjectSettings extends Component {
  constructor(props) {
    super(props);
    if (props.project) {
      this.state = {
        error: undefined,
        project: JSON.parse(JSON.stringify(props.project)),
        deviceKey: undefined,
        userSearchValue: '',
        codeSnippetModalOpen: props.codeSnippetModalOpen || false
      };
    } else {
      this.state = {
        error: undefined,
        originalProject: undefined,
        project: undefined,
        originalUsers: []
      };
    }
    this.onDeleteProject = this.onDeleteProject.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onUserNameChange = this.onUserNameChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.onEnableDeviceApi = this.onEnableDeviceApi.bind(this);
    this.onDisableDeviceApi = this.onDisableDeviceApi.bind(this);
    this.onDeviceApiSwitch = this.onDeviceApiSwitch.bind(this);
    this.toggleCodeSnippetModal = this.toggleCodeSnippetModal.bind(this);
    this.usersValid = this.usersValid.bind(this);
    this.deleteUserName = this.deleteUserName.bind(this);
    this.onChangeUserNameSuggestion = this.onChangeUserNameSuggestion.bind(
      this
    );
    this.onAddUserName = this.onAddUserName.bind(this);
    this.init = this.init.bind(this);
    this.init();
    if (this.props.codeSnippetModalOpen) {
      getDeviceApiKey.apply().then(key => {
        if (!key.deviceApiKey || !props.project.enableDeviceApi) {
          if (!key.deviceApiKey) {
            this.onEnableDeviceApi();
          }
          if (!props.project.enableDeviceApi) {
            this.onDeviceApiSwitch(true);
          }
        }
      });
    }
  }

  onChangeUserNameSuggestion(e) {
    this.setState({
      userSearchValue: e.target.value
    });
  }

  onAddUserName(e) {
    e.preventDefault();
    const project = this.state.project;
    project.users.push({ userName: e.target.value });
    this.setState({
      project: project,
      userSearchValue: ''
    });
  }

  usersValid(users) {
    return users.every(
      elm =>
        elm.userName !== this.props.userName &&
        elm.userName !== this.props.userMail
    );
  }

  async init() {
    const apiKey = await getDeviceApiKey();
    this.setState({
      deviceKey: apiKey.deviceApiKey
    });
  }

  onDeviceApiSwitch(checked) {
    switchDeviceApiActive(checked)
      .then(data => {
        this.props.onProjectsChanged(data);
      })
      .catch(err => console.log(err));
  }

  onEnableDeviceApi() {
    setDeviceApiKey().then(data => {
      this.setState({
        deviceKey: data.deviceApiKey
      });
    });
  }

  onDisableDeviceApi() {
    deleteDeviceApiKey().then(data => {
      this.setState({
        deviceKey: undefined
      });
    });
  }

  toggleCheck(e, user) {
    if (!this.state.usersToDelete.includes(user)) {
      this.setState({
        usersToDelete: [...this.state.usersToDelete, user]
      });
    } else {
      this.setState({
        usersToDelete: this.state.usersToDelete.filter(elm => elm !== user)
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      JSON.stringify(prevProps.project) !== JSON.stringify(this.props.project)
    ) {
      this.init();
      this.setState({
        project: this.props.project,
        originalProject: this.props.project,
        originalUsers: this.props.project.users
      });
    }
  }

  onSave() {
    updateProject(this.state.project)
      .then(data => {
        this.props.onProjectsChanged(data);
      })
      .catch(err => {
        this.setState({
          error: err
        });
      });
  }

  deleteUserName(userName) {
    const project = this.state.project;
    project.users = project.users.filter(elm => elm.userName !== userName);
    this.setState({
      project: project
    });
  }

  onNameChanged(newName) {
    var tmpProject = { ...this.state.project };
    tmpProject.name = newName;
    this.setState({
      project: tmpProject,
      error: undefined
    });
  }

  onDeleteProject() {
    var doDelete = window.confirm('Do you want to delete this project?');
    if (doDelete) {
      this.props.onDeleteProject(this.state.project);
    }
  }

  onUserNameChange(index, e) {
    const project = { ...this.state.project };
    project.users[index].userName = e.target.value;
    this.setState({
      project: project,
      error: undefined
    });
  }

  toggleCodeSnippetModal(open) {
    this.setState({
      codeSnippetModalOpen: open
    });
    let newPath;
    if (!open) {
      newPath = '.';
    } else {
      newPath = this.props.location.pathname.replace(
        new RegExp('settings/?'),
        'settings/getCode'
      );
    }
    this.props.history.push(newPath);
  }

  render() {
    var changes = false;
    if (this.props.project && this.props.project.users) {
      var originalUsers = this.props.project.users.map(elm => elm.userName);
      changes =
        this.state.project.name !== this.props.project.name ||
        !(
          this.state.project.users.map(elm =>
            originalUsers.includes(elm.user)
          ) &&
          this.state.project.users.length === this.props.project.users.length
        );
    }

    const backendUrl =
      API_URI.replace('/api/', '') === ''
        ? window.location.origin
        : API_URI.replace('/api/', '');

    if (!this.props.project) {
      return <NoProjectPage></NoProjectPage>;
    }
    return (
      <div id="projectSettings" style={{ marginTop: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ marginBottom: '0px' }}>
              {'Edit Project: ' + this.props.project.name}
            </h3>
            {this.state.project.users ? (
              <Button
                id="buttonDeleteProject"
                onClick={this.onDeleteProject}
                color="danger"
              >
                Delete project
              </Button>
            ) : null}
          </div>
          <hr></hr>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Name'}</InputGroupText>
            </InputGroupAddon>
            <Input
              id="projectName"
              readOnly={!this.props.project.users}
              placeholder={'Name'}
              value={this.state.project.name}
              onChange={e => this.onNameChanged(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Admin'}</InputGroupText>
            </InputGroupAddon>
            <Input value={this.props.project.admin.userName} readOnly />
          </InputGroup>
        </div>
        <hr />
        <div style={{ paddingTop: '16px', display: 'flex' }}>
          <h5 style={{ display: 'inline' }}>Device-API</h5>
          {this.state.project.users ? (
            <FormGroup style={{ margin: 0 }}>
              <CustomInput
                className="ml-2"
                inline
                type="switch"
                id="exampleCustomSwitch"
                checked={this.props.project.enableDeviceApi}
                onChange={e => this.onDeviceApiSwitch(e.target.checked)}
              />
            </FormGroup>
          ) : null}
        </div>
        {this.props.project.enableDeviceApi || this.props.project.users ? (
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>{'Backend-URL'}</InputGroupText>
              </InputGroupAddon>
              <Input value={backendUrl} readOnly />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>{'Key'}</InputGroupText>
              </InputGroupAddon>
              <Input
                value={
                  this.state.deviceKey
                    ? this.state.deviceKey
                    : 'Device-API is disabled for your user'
                }
                readOnly
              />
            </InputGroup>
            <div>
              <Button
                disabled={!this.props.project.enableDeviceApi}
                color="primary"
                onClick={this.onEnableDeviceApi}
              >
                {this.state.deviceKey ? 'Change key' : 'Generate key'}
              </Button>
              <Button
                className="mx-2"
                color="danger"
                disabled={!this.props.project.enableDeviceApi}
                onClick={this.onDisableDeviceApi}
              >
                Remove key
              </Button>
              <Button
                color="primary"
                disabled={
                  !this.props.project.enableDeviceApi || !this.state.deviceKey
                }
                onClick={() => this.toggleCodeSnippetModal(true)}
              >
                Get code
              </Button>
            </div>
            <hr />
          </div>
        ) : (
          <h6>Feature disabled by project admin</h6>
        )}
        {this.state.project.users ? (
          <div>
            <h5 style={{ paddingTop: '16px' }}>Users</h5>
            <Row style={{ padding: '8px' }} className="user-search-heading">
              <Col className="col-2 font-weight-bold">Search users: </Col>
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
                    ...this.state.project.users.map(elm => elm.userName),
                    this.props.userName
                  ]}
                ></AutoCompleteInput>
              </Col>
            </Row>
            <Table striped>
              <thead>
                <tr className="table-record">
                  <th className="table-record-left">#</th>
                  <th className="table-record-center">User</th>
                  <th className="table-record-right">Delete</th>
                </tr>
              </thead>
              <tbody>
                {this.state.project.users.map((user, index) => {
                  return (
                    <tr className="table-record" key={user + index}>
                      <td className="table-record-left">{index + 1}</td>
                      <td className="table-record-center">{user.userName}</td>
                      <td className="datasets-column table-record-right">
                        <Button
                          className="button-delete-user"
                          color="danger"
                          size="sm"
                          onClick={() => this.deleteUserName(user.userName)}
                        >
                          <FontAwesomeIcon
                            className="mr-2"
                            icon={faTrash}
                          ></FontAwesomeIcon>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{ color: 'red', display: 'flex', alignItems: 'center' }}
              >
                {this.usersValid(this.state.project.users)
                  ? this.state.error
                    ? 'Could not add users. Make sure they exist'
                    : null
                  : `${this.props.userName} is already in the project`}
              </div>
            </div>
            <hr></hr>
            <div
              style={{
                display: 'flex',
                justifyContent: 'right'
              }}
            >
              <Button
                id="buttonSaveProject"
                color="primary"
                onClick={this.onSave}
                disabled={!this.usersValid(this.state.project.users)}
              >
                Save
              </Button>
            </div>
          </div>
        ) : null}
        <CodeSnippetModal
          isOpen={this.state.codeSnippetModalOpen}
          onCancel={() => this.toggleCodeSnippetModal(false)}
          backendUrl={backendUrl}
          deviceApiKey={this.state.deviceKey}
        ></CodeSnippetModal>
        <Prompt
          when={changes}
          message={(location, action) => {
            if (this.props.location.pathname === location.pathname) {
              return true;
            }
            return 'Changes have not been saved. Do you want to leave?';
          }}
        />
      </div>
    );
  }
}

export default ProjectSettings;
