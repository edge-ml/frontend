import React, { Component } from "react";
import {
  Modal,
  Button,
  TextInput,
  Table,
} from "@mantine/core";

import {
  updateProject,
  createProject,
} from "./../../services/ApiServices/ProjectService";

import AutoCompleteInput from "../../components/AutoCompleteInput/AutocompleteInput";
import { getUserNameSuggestions } from "../../services/ApiServices/AuthentificationServices";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import "./EditProjectModal.css";

class EditProjectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: undefined,
      userSearchValue: "",
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
      userSearchValue: "",
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
        .catch((err) => {});
    }
  }

  componentWillReceiveProps(nextProps) {
    const newProject = { name: "", users: [] };
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
      <tr key={userName}>
        <td>{index + 1}</td>
        <td>{userName}</td>
        <td>
          <Button
            className="button-delete-user"
            color="red"
            size="xs"
            onClick={() => this.deleteUserName(userName)}
          >
            <FontAwesomeIcon icon={faTrash} />
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
      <Modal id="editProjectModal" opened={this.props.isOpen} onClose={this.onCancel} title={
        this.props.isNewProject
          ? "Create new Project"
          : "Edit Project: " + this.state.originalProject.name
      }>
        <Modal.Body>
          <TextInput
            label="Name"
            id="inputProjectName"
            placeholder="Project-name"
            value={this.state.project.name}
            onChange={(e) => this.onNameChanged(e.target.value)}
          />
          <TextInput
            label="Admin"
            readOnly
            id="inputProjectAdmin"
            placeholder="Project-admin"
            value={this.props.userName}
          />
          {this.props.isNewProject ? null : (
            <TextInput
              label="Admin"
              value={this.state.project.admin.userName}
              readOnly
            />
          )}
          <h5 style={{ paddingTop: "16px" }}>Users</h5>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Search users: </span>
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
            />
          </div>
          <Table striped>
            <thead>
              <tr>
                <th>#</th>
                <th>UserName</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {this.state.project.users.map((elm, index) =>
                this.generateTableEntry(elm.userName, index)
              )}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: "space-between" }}>
          <Button
            id="btnSaveProject"
            color="blue"
            style={{ margin: "0.25rem" }}
            onClick={this.onSave}
          >
            Save
          </Button>
          <div className="error-text"> {this.state.error}</div>
          <Button
            id="btnSaveProjectCancel"
            variant="outline"
            color="gray"
            style={{ margin: "0.25rem" }}
            onClick={this.onCancel}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
export default EditProjectModal;
