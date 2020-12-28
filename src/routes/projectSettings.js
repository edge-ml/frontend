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
  FormGroup
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
        project: objectCopy,
        originalProject: objectCopy,
        originalUsers: objectCopy.users
      };
    } else {
      this.state = {
        originalProject: undefined,
        project: undefined,
        originalUsers: []
      };
    }
    this.onDeleteProject = this.onDeleteProject.bind(this);
    this.initState = this.initState.bind(this);
    this.onAddUser = this.onAddUser.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
  }

  initState(project, isNewProject) {
    if (!isNewProject) {
      var objectCopy = JSON.parse(JSON.stringify(project));
      this.setState({
        project: objectCopy,
        originalProject: objectCopy,
        originalUsers: objectCopy.users
      });
    } else {
      const newProject = { name: '', users: [] };
      this.setState({
        project: newProject,
        originalUsers: project.users
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.project._id !== this.props.project._id) {
      this.initState(nextProps.project, nextProps.isNewProject);
    }
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

  onNameChanged(newName) {
    var tmpProject = { ...this.state.project };
    tmpProject.name = newName;
    this.setState({
      project: tmpProject
    });
  }

  onAddUser() {
    var tmpProject = { ...this.state.project };
    tmpProject.users.push({ _id: '', email: undefined });
    this.setState({
      project: tmpProject
    });
  }

  onDeleteProject() {
    var doDelete = window.confirm('Do you want to delete this dataset?');
    if (doDelete) {
      deleteProject(this.state.project).then(data =>
        this.props.projectChanged(data)
      );
    }
  }

  render() {
    if (!this.state.project) {
      return <NoProjectPage></NoProjectPage>;
    }
    if (!this.state.project.users) {
      return <h1>You need admin rights</h1>;
    }
    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ marginBottom: '0px' }}>
            {'Edit Project: ' + this.state.originalProject.name}
          </h3>
          <Button onClick={this.onDeleteProject} color="danger">
            Delete dataset
          </Button>
        </div>
        <hr></hr>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{'Name'}</InputGroupText>
          </InputGroupAddon>
          <Input
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
            <Input value={this.props.project.admin.email} readOnly />
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
                      user.email
                    ) : (
                      <Input
                        type="text"
                        name="User ID"
                        placeholder="Enter user_id"
                      />
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
        <Button color="primary" className="btn-sm" onClick={this.onAddUser}>
          Add +
        </Button>
        <hr></hr>
        <div style={{ display: 'flex' }}>
          <Button color="primary" className="m-1 mr-auto" onClick={this.onSave}>
            Save
          </Button>{' '}
          <Button color="secondary" className="m-1" onClick={this.onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }
}
export default ProjectSettings;
