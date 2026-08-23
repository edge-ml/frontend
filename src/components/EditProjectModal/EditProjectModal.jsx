import React, { useState } from "react";
import { Button, TextInput, Table } from "@mantine/core";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";

import useCreateProject from "../../Hooks/useCreateProject";
import AutoCompleteInput from "../../components/AutoCompleteInput/AutocompleteInput";
import { getUserNameSuggestions } from "../../services/ApiServices/AuthentificationServices";

import "./EditProjectModal.css";
import useUserStore from "../../Hooks/useUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import useProjectStore from "../../stores/projectStore";

const EditProjectModal = ({ isOpen, onClose }) => {
  const [userSearchValue, setUserSearchValue] = useState("");
  const projects = useProjectStore((state) => state.projects);

  const { project, setProjectName, createProject, addUser, removeUser } =
    useCreateProject();

  return (
    <Modal id="editProjectModal" isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Create new Project</ModalHeader>
      <ModalBody>
        <TextInput
          label="Name"
          id="inputProjectName"
          placeholder="Project-name"
          value={project.name}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <TextInput
          label="Admin"
          disabled
          id="inputProjectAdmin"
          placeholder="Project-admin"
          value={project.admin.name + " (" + project.admin.mail + ")"}
        />
        <h5 style={{ paddingTop: "16px" }}>Users</h5>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>Search user</span>
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
                      project.admin.userName,
                    ]}
                  />
                </div>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {project.users.length === 0 ? (
              <Table.Tr>
                <Table.Td>
                  <div className="d-flex justify-content-center">
                    No users added yet
                  </div>
                </Table.Td>
              </Table.Tr>
            ) : (
              project.users.map((elm) => (
                <Table.Tr key={elm.userName}>
                  <Table.Td>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        margin: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <b>{elm.userName}</b>
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          color="red"
                          onClick={() => removeUser(elm.userName)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </Button>
                      </div>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ModalBody>
      <ModalFooter style={{ justifyContent: "flex-end" }}>
        <Button
          variant="outline"
          id="btnSaveProject"
          color="blue"
          style={{ margin: "0.25rem" }}
          onClick={async () => {
            await createProject();
            onClose();
          }}
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditProjectModal;
