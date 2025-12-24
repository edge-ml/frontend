import React, { Component } from "react";
import {
  Box,
  Button,
  Grid,
  Group,
  Modal,
  Table,
  Text,
  TextInput,
  Title,
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
      <Table.Tr className="table-record" key={userName}>
        <Table.Td className="table-record-left">
          {index + 1}
        </Table.Td>
        <Table.Td className="table-record-center">{userName}</Table.Td>
        <Table.Td className="table-record-right">
          <Button
            className="button-delete-user"
            color="danger"
            size="sm"
            onClick={() => this.deleteUserName(userName)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </Table.Td>
      </Table.Tr>
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
      <Modal id="editProjectModal" opened={this.props.isOpen} onClose={this.onCancel}>
        <Title order={4}>
          {this.props.isNewProject
            ? "Create new Project"
            : "Edit Project: " + this.state.originalProject.name}
        </Title>
        <Box mt="sm">
          <TextInput
            id="inputProjectName"
            label="Name"
            placeholder="Project-name"
            value={this.state.project.name}
            onChange={(e) => this.onNameChanged(e.target.value)}
          />
          <TextInput
            readOnly
            id="inputProjectAdmin"
            label="Admin"
            placeholder="Project-admin"
            value={this.props.userName}
            mt="sm"
          />
          {this.props.isNewProject ? null : (
            <TextInput
              label="Admin"
              value={this.state.project.admin.userName}
              readOnly
              mt="sm"
            />
          )}
          <Title order={5} mt="md">
            Users
          </Title>
          <Grid className="user-search-heading" align="center" mt="xs">
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Text>Search users:</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 9 }}>
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
            </Grid.Col>
          </Grid>
          <Table striped mt="sm">
            <Table.Thead>
              <Table.Tr className="table-record">
                <Table.Th className="table-record-left">#</Table.Th>
                <Table.Th className="table-record-center">UserName</Table.Th>
                <Table.Th className="table-record-right">Delete</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {this.state.project.users.map((elm, index) =>
                this.generateTableEntry(elm.userName, index)
              )}
            </Table.Tbody>
          </Table>
        </Box>
        <Group justify="space-between" mt="md">
          <Button id="btnSaveProject" color="blue" onClick={this.onSave}>
            Save
          </Button>
          <Text className="error-text">{this.state.error}</Text>
          <Button id="btnSaveProjectCancel" color="gray" onClick={this.onCancel}>
            Cancel
          </Button>
        </Group>
      </Modal>
    );
  }
}
export default EditProjectModal;
