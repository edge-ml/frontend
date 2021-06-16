import React, { Component } from 'react';
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Table,
  CustomInput
} from 'reactstrap';

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
import AutocompleteInput from '../components/AutoCompleteInput/AutocompleteInput';
import { getUserNameSuggestions } from '../services/ApiServices/AuthentificationServices';
import { FormGroup } from 'react-bootstrap';

class ProjectSettings extends Component {
  constructor(props) {
    super(props);
    if (props.project) {
      var objectCopy = JSON.parse(JSON.stringify(props.project));
      this.state = {
        error: undefined,
        project: objectCopy,
        originalProject: objectCopy,
        originalUsers: objectCopy.users,
        usersToDelete: [],
        deviceKey: undefined
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
    this.onAddUser = this.onAddUser.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onUserNameChange = this.onUserNameChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.onEnableDeviceApi = this.onEnableDeviceApi.bind(this);
    this.onDisableDeviceApi = this.onDisableDeviceApi.bind(this);
    this.onDeviceApiSwitch = this.onDeviceApiSwitch.bind(this);
    this.init = this.init.bind(this);
    this.init();
  }

  async init() {
    const apiKey = await getDeviceApiKey();
    this.setState({
      deviceKey: apiKey.deviceApiKey
    });
  }

  onDeviceApiSwitch(e) {
    switchDeviceApiActive(e.target.checked)
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
    const tmpUsers = this.state.project.users.filter(
      elm => !this.state.usersToDelete.includes(elm)
    );
    updateProject({ ...this.state.project, users: tmpUsers })
      .then(data => {
        const projectIndex = data.findIndex(
          elm => elm._id === this.state.project._id
        );
        this.props.onProjectsChanged(data, projectIndex);
      })
      .catch(err => {
        this.setState({
          error: err
        });
      });
  }

  onDeleteUser(index) {
    const tmpUsers = this.state.project.users.filter(
      (elm, idx) => idx !== index
    );
    this.setState({
      project: {
        ...this.state.project,
        users: tmpUsers
      },
      error: undefined
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

  onAddUser(e) {
    var tmpProject = { ...this.state.project };
    tmpProject.users.push({ _id: undefined, userName: '' });
    this.setState({
      project: tmpProject,
      error: undefined
    });
  }

  onDeleteProject() {
    var doDelete = window.confirm('Do you want to delete this project?');
    if (doDelete) {
      deleteProject(this.state.project).then(data =>
        this.props.onProjectsChanged(data)
      );
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

  render() {
    if (!this.state.project) {
      return <NoProjectPage></NoProjectPage>;
    }
    return (
      <div id="projectSettings" style={{ marginTop: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ marginBottom: '0px' }}>
              {'Edit Project: ' + this.state.originalProject.name}
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
                defaultChecked={this.props.project.enableDeviceApi}
                onClick={this.onDeviceApiSwitch}
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
              <Input
                value={
                  API_URI.replace('/api/', '') === ''
                    ? window.location.origin
                    : API_URI.replace('/api/', '')
                }
                readOnly
              />
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
                className="mr-2"
                color="primary"
                onClick={this.onEnableDeviceApi}
              >
                {this.state.deviceKey ? 'Change key' : 'Generate key'}
              </Button>
              <Button
                color="danger"
                disabled={!this.props.project.enableDeviceApi}
                onClick={this.onDisableDeviceApi}
              >
                Remove key
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
            <Table striped>
              <thead>
                <tr>
                  <th>Delete</th>
                  <th>User</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.state.project.users.map((user, index) => {
                  const oldUser =
                    this.state.originalUsers
                      .map(elm => elm._id)
                      .includes(user._id) && user._id !== undefined;
                  return (
                    <tr key={user + index}>
                      <td className="datasets-column">
                        <Input
                          id={'checkboxDeleteUser' + index}
                          style={{ visibility: !oldUser ? 'hidden' : '' }}
                          className="datasets-check"
                          type="checkbox"
                          checked={this.state.usersToDelete.includes(user)}
                          onChange={e => this.toggleCheck(e, user)}
                        />
                      </td>
                      <td>
                        {oldUser ? (
                          user.userName
                        ) : (
                          <AutocompleteInput
                            getSuggestions={getUserNameSuggestions}
                            filter={[
                              ...this.state.project.users.map(
                                elm => elm.userName
                              ),
                              this.state.project.admin.userName
                            ]}
                            id={'inputUserMail' + index}
                            type="text"
                            value={user.userName}
                            placeholder="Enter username"
                            onChange={e => this.onUserNameChange(index, e)}
                          ></AutocompleteInput>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          id={'buttonUserMail' + index}
                          style={{ visibility: oldUser ? 'hidden' : '' }}
                          className="btn-sm"
                          color="secondary"
                          onClick={() => this.onDeleteUser(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Button id="buttonAddUser" color="primary" onClick={this.onAddUser}>
              Add +
            </Button>
            <Button
              id="buttonSaveProject"
              color="primary"
              className="m-1"
              onClick={this.onSave}
            >
              Save
            </Button>{' '}
            <hr></hr>
            <div style={{ display: 'flex' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'red',
                  marginLeft: '16px'
                }}
              >
                {this.state.error}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
export default ProjectSettings;
