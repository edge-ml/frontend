import React, { useState } from "react";
import { Box, Button, Group, Modal, Stack, Text, TextInput, Title } from "@mantine/core";

import useCreateProject from "../../Hooks/useCreateProject";
import AutoCompleteInput from "../../components/AutoCompleteInput/AutocompleteInput";
import { getUserNameSuggestions } from "../../services/ApiServices/AuthentificationServices";

import "./EditProjectModal.css";
import useUserStore from "../../Hooks/useUser";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../Common/EdgeMLTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import useProjectStore from "../../stores/projectStore";

const EditProjectModal = ({ isOpen, onClose }) => {
  const [userSearchValue, setUserSearchValue] = useState("");
  const projects = useProjectStore((state) => state.projects);

  const { project, setProjectName, createProject, addUser, removeUser } =
    useCreateProject();

  console.log(project.users);

  return (
    <Modal id="editProjectModal" opened={isOpen} onClose={onClose} size="lg">
      <Title order={4}>Create new Project</Title>
      <Stack mt="sm">
        <TextInput
          id="inputProjectName"
          label="Name"
          placeholder="Project-name"
          value={project.name}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <TextInput
          disabled
          id="inputProjectAdmin"
          label="Admin"
          placeholder="Project-admin"
          value={project.admin.name + " (" + project.admin.mail + ")"}
        />
        <Title order={5} mt="md">
          Users
        </Title>
        <EdgeMLTable>
          <EdgeMLTableHeader>
            <Group align="center" gap="xs">
              <Text>Search user</Text>
              <AutoCompleteInput
                type="text"
                name="User ID"
                value={userSearchValue}
                placeholder="Enter username"
                onClick={(e) => {
                  addUser(e);
                  setUserSearchValue("");
                }}
                onChange={(e) => setUserSearchValue(e.target.value)}
                getsuggestions={getUserNameSuggestions}
                filter={[
                  ...project.users.map((elm) => elm.userName),
                  project.admin.name,
                ]}
              />
            </Group>
          </EdgeMLTableHeader>
          {project.users.map((elm) => {
            return (
              <EdgeMLTableEntry key={elm.userName}>
                <Group justify="space-between" m="sm" align="center">
                  <Text fw={700}>{elm.userName}</Text>
                  <Button
                    variant="outline"
                    color="red"
                    onClick={() => removeUser(elm.userName)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                </Group>
              </EdgeMLTableEntry>
            );
          })}
          {project.users.length === 0 && (
            <Group justify="center" m="sm">
              <Text>No users added yet</Text>
            </Group>
          )}
        </EdgeMLTable>
      </Stack>
      <Group justify="flex-end" mt="md">
        <Button
          variant="outline"
          id="btnSaveProject"
          color="blue"
          onClick={async () => {
            await createProject();
            onClose();
          }}
        >
          Save
        </Button>
      </Group>
    </Modal>
  );
};

export default EditProjectModal;
