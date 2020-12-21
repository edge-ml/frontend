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

import { updateProject } from './../../services/ApiServices/ProjectService';

class EditProjectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalProject: undefined,
      project: undefined
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  onSave() {
    updateProject(this.state.project)
      .then(data => {
        this.props.projectChanged(data);
      })
      .catch(err => {});
  }

  componentDidMount() {
    this.setState({
      originalProject: this.props.project,
      project: this.props.project,
      ready: true
    });
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      originalProject: props.project
    });
  }

  onNameChanged(newName) {
    var tmpProject = { ...this.state.project };
    tmpProject.name = newName;
    this.setState({
      project: tmpProject
    });
  }

  render() {
    if (!this.state.project) return null;
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>
          Edit Project: {this.state.originalProject.name}
        </ModalHeader>
        <ModalBody>
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
          <h5>Users</h5>
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
                    <td>{user}</td>
                    <td>
                      <Button className="btn-sm" color="danger">
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className="m-1 mr-auto" onClick={this.onSave}>
            Save
          </Button>{' '}
          <Button
            color="secondary"
            className="m-1"
            onClick={this.props.onClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default EditProjectModal;
