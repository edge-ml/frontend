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
  Row,
  Alert,
  Container,
  Collapse,
} from 'reactstrap';
import ListItem from './ListItem';
import ListItemModal from './ListItemModal';
import DeleteProject from './DeleteProject';
import EditName from './EditName';
import GenerateCode from './GenerateCode';

import { Prompt, withRouter } from 'react-router-dom';

import {
  deleteProject,
  updateProject,
} from './../../services/ApiServices/ProjectService';
import {
  switchDeviceApiActive,
  getDeviceApiKey,
  setDeviceApiKey,
  deleteDeviceApiKey,
} from '../../services/ApiServices/DeviceApiService';

import NoProjectPage from './../../components/NoProjectPage/NoProjectPage';
import { getUserNameSuggestions } from '../../services/ApiServices/AuthentificationServices';
import CodeSnippetModal from '../../components/ApiSnippetsModal/CodeSnippetModal';
import { FormGroup } from 'react-bootstrap';
import AutoCompleteInput from '../../components/AutoCompleteInput/AutocompleteInput';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const options = [
  {
    header: {
      name: 'General',
    },
    values: [
      {
        index: 0,
        name: 'Edit Project Name',
        description: 'Edit the name of this project',
        tags: ['admin', 'name'],
        isModal: false,
      },
      {
        index: 1,
        name: 'Delete Project',
        description: 'Completely remove the project',
        tags: ['delete', 'remove'],
        isModal: false,
      },
    ],
  },
  {
    header: {
      name: 'Device API',
    },
    values: [
      {
        index: 2,
        name: 'Key Settings',
        description: 'Create or remove device API key',
        tags: ['change key', 'remove key', 'get code'],
        isModal: false,
      },
    ],
  },
  {
    header: {
      name: 'Users',
    },
    values: [
      {
        index: 3,
        name: 'Edit Users',
        description: 'Add or remove users from project',
        tags: ['add user', 'delete user', 'remove user', 'change user name'],
        isModal: true,
      },
    ],
  },
];

class Settings extends Component {
  constructor(props) {
    super(props);
    if (props.project) {
      this.state = {
        error: undefined,
        project: JSON.parse(JSON.stringify(props.project)),
        deviceKey: undefined,
        userSearchValue: '',
        codeSnippetModalOpen: props.codeSnippetModalOpen || false,
        alertText: undefined,
        saveSuccess: undefined,
        visibleOptions: options,
      };
    } else {
      this.state = {
        error: undefined,
        originalProject: undefined,
        project: undefined,
        originalUsers: [],
        alertText: undefined,
        saveSuccess: undefined,
        visibleOptions: options,
      };
    }
    this.setVisibleOptions = this.setVisibleOptions.bind(this);
    this.mapOptions = this.mapOptions.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onDeleteProject = this.onDeleteProject.bind(this);
    this.onLeaveProject = this.onLeaveProject.bind(this);
    this.onProjectNameSave = this.onProjectNameSave.bind(this);
    this.onUserNameChange = this.onUserNameChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.onEnableDeviceApi = this.onEnableDeviceApi.bind(this);
    this.onDisableDeviceApi = this.onDisableDeviceApi.bind(this);
    this.onDeviceApiSwitch = this.onDeviceApiSwitch.bind(this);
    this.usersValid = this.usersValid.bind(this);
    this.deleteUserName = this.deleteUserName.bind(this);
    this.onChangeUserNameSuggestion =
      this.onChangeUserNameSuggestion.bind(this);
    this.onAddUserName = this.onAddUserName.bind(this);
    this.getComponent = this.getComponent.bind(this);
    this.init = this.init.bind(this);
    this.init();
    if (this.props.codeSnippetModalOpen) {
      getDeviceApiKey.apply().then((key) => {
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

  async init() {
    const apiKey = await getDeviceApiKey();
    this.setState({
      deviceKey: apiKey.deviceApiKey,
    });
  }

  onChangeUserNameSuggestion(e) {
    this.setState({
      userSearchValue: e.target.value,
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

  usersValid(users) {
    return users.every(
      (elm) =>
        elm.userName !== this.props.userName &&
        elm.userName !== this.props.userMail
    );
  }

  onDeviceApiSwitch(checked) {
    switchDeviceApiActive(checked)
      .then((data) => {
        this.props.onProjectsChanged(data);
      })
      .catch((err) => console.log(err));
  }

  onEnableDeviceApi() {
    setDeviceApiKey().then((data) => {
      this.setState({
        deviceKey: data.deviceApiKey,
      });
    });
  }

  onDisableDeviceApi() {
    deleteDeviceApiKey().then((data) => {
      this.setState({
        deviceKey: undefined,
      });
    });
  }

  toggleCheck(e, user) {
    if (!this.state.usersToDelete.includes(user)) {
      this.setState({
        usersToDelete: [...this.state.usersToDelete, user],
      });
    } else {
      this.setState({
        usersToDelete: this.state.usersToDelete.filter((elm) => elm !== user),
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
        originalUsers: this.props.project.users,
      });
    }
  }

  onSave() {
    const resetAlert = () => {
      setTimeout(() => {
        this.setState({
          alertText: undefined,
        });
      }, 2000);
    };

    updateProject(this.state.project)
      .then((data) => {
        this.props.onProjectsChanged(data);
        this.setState({
          alertText: 'Data saved',
          saveSuccess: true,
        });
        resetAlert();
      })
      .catch((err) => {
        this.setState({
          error: err,
        });
        this.setState({
          alertText: 'Could not save data',
          saveSuccess: false,
        });
        resetAlert();
      });
  }

  deleteUserName(userName) {
    const project = this.state.project;
    project.users = project.users.filter((elm) => elm.userName !== userName);
    this.setState({
      project: project,
    });
  }

  onProjectNameSave(newName) {
    this.setState(
      {
        project: { ...this.state.project, name: newName },
        error: undefined,
      },
      () => {
        console.log('test');
        this.onSave();
      }
    );
  }

  onDeleteProject() {
    var doDelete = window.confirm('Do you want to delete this project?');
    if (doDelete) {
      this.props.onDeleteProject(this.state.project);
    }
  }

  onLeaveProject() {
    var doLeave = window.confirm(
      'Do you want to leave this project? If you change your mind, you will have to ask the project admin to add you again.'
    );
    if (doLeave) {
      this.props.onLeaveProject(this.state.project);
    }
  }

  onUserNameChange(index, e) {
    const project = { ...this.state.project };
    project.users[index].userName = e.target.value;
    this.setState({
      project: project,
      error: undefined,
    });
  }

  setVisibleOptions(options) {
    this.setState({ visibleOptions: options });
  }

  onChangeSearch(e) {
    e.preventDefault();
    const value = e.target.value;

    if (value.trim().length === 0) {
      this.setVisibleOptions(options);
      return;
    }

    const returnedItems = [];
    this.state.visibleOptions.forEach((option, index) => {
      const foundOptions = option.values.filter((item) => {
        return (
          item.name.toLocaleLowerCase().search(value.trim().toLowerCase()) !==
            -1 ||
          item.description
            .toLocaleLowerCase()
            .search(value.trim().toLowerCase()) !== -1
        );
      });
      returnedItems[index] = {
        header: {
          name: option.header.name,
        },
        values: foundOptions,
      };
    });

    this.setVisibleOptions(returnedItems);
  }

  mapOptions() {
    return this.state.visibleOptions.map((option) => (
      <div key={option.header.name} className="mt-5 mb-2">
        <h3>{option.header.name}</h3>
        <div>
          {option.values.map((value) => {
            if (value.isModal) {
              return (
                <ListItemModal
                  value={value}
                  component={this.getComponent(value.index)}
                />
              );
            } else {
              return (
                <ListItem
                  value={value}
                  component={this.getComponent(value.index)}
                />
              );
            }
          })}
        </div>
      </div>
    ));
  }

  getComponent(index) {
    switch (index) {
      case 0:
        return (
          <EditName
            readonly={!this.props.project.users}
            value={this.state.project.name}
            onProjectNameSave={this.onProjectNameSave}
            adminUserName={this.props.project.admin.userName}
            projectName={this.state.project.name}
          />
        );
      case 1:
        return (
          <DeleteProject
            onDeleteProject={this.onDeleteProject}
            userName={this.props.userName}
            adminUserName={this.props.project.admin.userName}
            onLeaveProject={this.onLeaveProject}
            project={this.state.project}
          />
        );
      case 2:
        return (
          <GenerateCode
            project={this.state.project}
            onDeviceApiSwitch={this.onDeviceApiSwitch}
            onEnableDeviceApi={this.onEnableDeviceApi}
            onDisableDeviceApi={this.onDisableDeviceApi}
            deviceKey={this.state.deviceKey}
            location={this.props.location}
            history={this.props.history}
          />
        );
      default:
        null;
    }
  }

  render() {
    console.log(this.props);
    var changes = false;
    if (this.props.project && this.props.project.users) {
      var originalUsers = this.props.project.users.map((elm) => elm.userName);
      changes =
        this.state.project.name !== this.props.project.name ||
        !(
          this.state.project.users.map((elm) =>
            originalUsers.includes(elm.user)
          ) &&
          this.state.project.users.length === this.props.project.users.length
        );
    }

    if (!this.props.project) {
      return <NoProjectPage></NoProjectPage>;
    }
    return (
      <Container className="my-5">
        <h3>{'Project Settings'}</h3>
        <Input
          type="text"
          className="form-control mt-3"
          placeholder="Search..."
          onChange={this.onChangeSearch}
        ></Input>
        {this.mapOptions()}
        <Prompt
          when={changes}
          message={(location, action) => {
            if (this.props.location.pathname === location.pathname) {
              return true;
            }
            return 'Changes have not been saved. Do you want to leave?';
          }}
        />
        {this.state.alertText ? (
          <Alert
            color={this.state.saveSuccess ? 'success' : 'danger'}
            style={{
              marginBottom: 0,
              position: 'fixed',
              zIndex: 100,
              bottom: '40px',
              left: '50%',
              marginLeft: '-100px',
            }}
          >
            {this.state.alertText}
          </Alert>
        ) : null}
      </Container>
    );
  }
}
export default Settings;
