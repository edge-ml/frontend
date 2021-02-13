import React, { Component } from 'react';
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Table
} from 'reactstrap';

import {
  deleteProject,
  updateProject
} from './../services/ApiServices/ProjectService';
import NoProjectPage from './../components/NoProjectPage/NoProjectPage';

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
        usersToDelete: []
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
    this.onUserMailChange = this.onUserMailChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
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
      this.setState({
        project: this.props.project
      });
    }
  }

  onSave() {
    const tmpUsers = this.state.project.users.filter(
      elm => !this.state.usersToDelete.includes(elm)
    );
    updateProject({ ...this.state.project, users: tmpUsers })
      .then(data => {
        this.props.onProjectsChanged(data);
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
    tmpProject.users.push({ _id: undefined, email: '' });
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

  onUserMailChange(index, e) {
    const project = { ...this.state.project };
    project.users[index].email = e.target.value;
    this.setState({
      project: project,
      error: undefined
    });
  }

  render() {
    if (!this.state.project) {
      return <NoProjectPage></NoProjectPage>;
    }
    if (!this.state.project.users) {
      return (
        <NoProjectPage text="You need admin rights to edit the project"></NoProjectPage>
      );
    }
    return (
      <div id="projectSettings" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ marginBottom: '0px' }}>
            {'Edit Project: ' + this.state.originalProject.name}
          </h3>
          <Button
            id="buttonDeleteProject"
            onClick={this.onDeleteProject}
            color="danger"
          >
            Delete project
          </Button>
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
          <Input value={this.props.project.admin.email} readOnly />
        </InputGroup>
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
                <tr key={oldUser}>
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
                      user.email
                    ) : (
                      <Input
                        id={'inputUserMail' + index}
                        type="text"
                        value={user.email}
                        placeholder="Enter user e-mail"
                        onChange={e => this.onUserMailChange(index, e)}
                      />
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
        <Button
          id="buttonAddUser"
          color="primary"
          className="btn-sm"
          onClick={this.onAddUser}
        >
          Add +
        </Button>
        <hr></hr>
        <div style={{ display: 'flex' }}>
          <Button
            id="buttonSaveProject"
            color="primary"
            className="m-1"
            onClick={this.onSave}
          >
            Save
          </Button>{' '}
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
    );
  }
}
export default ProjectSettings;
