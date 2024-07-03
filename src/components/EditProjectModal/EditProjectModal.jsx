import React, { useState } from "react";
import {
  Button,
  InputGroup,
  InputGroupText,
  Input,
  Table,
  Col,
  Row,
  FormFeedback,
} from "reactstrap";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";

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
    <Modal id="editProjectModal" isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Create new Project</ModalHeader>
      <ModalBody>
        <InputGroup>
          <InputGroupText>{"Name"}</InputGroupText>
          <Input
            id="inputProjectName"
            placeholder={"Project-name"}
            value={project.name}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <FormFeedback>
            
          </FormFeedback>
        </InputGroup>
        <InputGroup>
          <InputGroupText>{"Admin"}</InputGroupText>
          <Input
            disabled
            id="inputProjectAdmin"
            placeholder={"Project-admin"}
            value={project.admin.name + " (" + project.admin.mail + ")"}
          />
        </InputGroup>
        <h5 style={{ paddingTop: "16px" }}>Users</h5>
        <EdgeMLTable>
          <EdgeMLTableHeader>
            <InputGroup>
              <InputGroupText>Search user</InputGroupText>
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
              ></AutoCompleteInput>
            </InputGroup>
          </EdgeMLTableHeader>
          {project.users.map((elm) => {
            return (
              <EdgeMLTableEntry>
                <div className="d-flex justify-content-between m-2 align-items-center">
                  <div>
                    <b>{elm.userName}</b>
                  </div>
                  <div>
                    <Button outline color="danger" onClick={() => removeUser(elm.userName)}>
                      <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>
                    </Button>
                  </div>
                </div>
              </EdgeMLTableEntry>
            );
          })}
          {project.users.length === 0 && (
            <div className="m-2 d-flex justify-content-center">
              No users added yet
            </div>
          )}
        </EdgeMLTable>
      </ModalBody>
      <ModalFooter className="justify-content-end">
        <Button
          outline
          id="btnSaveProject"
          color="primary"
          className="m-1"
          onClick={async () => {
            await createProject();
            onClose();
          }}
        >
          Save
        </Button>{" "}
      </ModalFooter>
    </Modal>
  );
};

export default EditProjectModal;
