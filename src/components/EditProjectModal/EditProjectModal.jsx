import React, { useState } from "react";
import { Button, Group, Modal, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

import AutoCompleteInput from "../../components/AutoCompleteInput/AutocompleteInput";
import { getUserNameSuggestions } from "../../services/ApiServices/AuthentificationServices";
import { createProject as createProject_api } from "../../services/ApiServices/ProjectService";

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
  const [userSearchError, setUserSearchError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const getProjects = useProjectStore((state) => state.getProjects);
  const { user } = useUserStore();

  const form = useForm({
    initialValues: {
      name: "",
      users: [],
    },
    validate: {
      name: (value) =>
        value && value.trim().length > 0 ? null : "Project name is required",
    },
  });

  const normalizeSuggestion = (item) => {
    if (typeof item === "string") {
      return item;
    }
    if (item && typeof item === "object") {
      return item.username || item.userName || item.email || "";
    }
    return "";
  };

  const userExists = async (userName) => {
    const suggestions = await getUserNameSuggestions(userName);
    const normalized = (suggestions || [])
      .map(normalizeSuggestion)
      .filter((item) => item !== "");
    return normalized.includes(userName);
  };

  const handleAddUser = async (nextUserName) => {
    const trimmed = (nextUserName || "").trim();
    if (!trimmed) {
      return;
    }
    if (form.values.users.includes(trimmed)) {
      setUserSearchValue("");
      setUserSearchError("");
      return;
    }
    const exists = await userExists(trimmed);
    if (!exists) {
      setUserSearchError("User not found");
      return;
    }
    form.setFieldValue("users", [...form.values.users, trimmed]);
    setUserSearchValue("");
    setUserSearchError("");
  };

  const handleRemoveUser = (userName) => {
    form.setFieldValue(
      "users",
      form.values.users.filter((user) => user !== userName)
    );
  };

  const handleClose = () => {
    form.reset();
    setUserSearchValue("");
    setUserSearchError("");
    onClose();
  };

  const handleSave = async () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }
    setIsSaving(true);
    try {
      const userChecks = await Promise.all(
        form.values.users.map((userName) => userExists(userName))
      );
      const invalidIndex = userChecks.findIndex((valid) => !valid);
      if (invalidIndex !== -1) {
        setUserSearchError(
          `User not found: ${form.values.users[invalidIndex]}`
        );
        return;
      }
      await createProject_api({
        name: form.values.name.trim(),
        admin: user,
        users: form.values.users.map((userName) => ({ userName })),
      });
      await getProjects();
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal id="editProjectModal" opened={isOpen} onClose={handleClose} size="lg">
      <Title order={4}>Create new Project</Title>
      <Stack mt="sm">
        <TextInput
          id="inputProjectName"
          label="Name"
          placeholder="Project-name"
          {...form.getInputProps("name")}
        />
        <TextInput
          disabled
          id="inputProjectAdmin"
          label="Admin"
          placeholder="Project-admin"
          value={user.userName + (user.email ? ` (${user.email})` : "")}
        />
        <Title order={5} mt="md">
          Users
        </Title>
        <EdgeMLTable>
          <EdgeMLTableHeader>
            <Group align="center" gap="xs" wrap="nowrap">
              <Text>Search user</Text>
              <AutoCompleteInput
                type="text"
                name="User ID"
                value={userSearchValue}
                placeholder="Enter username"
                onClick={(e) => handleAddUser(e.target.value)}
                onChange={(e) => {
                  setUserSearchValue(e.target.value);
                  setUserSearchError("");
                }}
                getsuggestions={getUserNameSuggestions}
                filter={[
                  ...form.values.users,
                  user.userName,
                ]}
              />
              <Button
                variant="outline"
                color="blue"
                disabled={!userSearchValue}
                onClick={() => handleAddUser(userSearchValue)}
              >
                Add
              </Button>
            </Group>
            {userSearchError ? (
              <Text size="xs" c="red" mt="xs">
                {userSearchError}
              </Text>
            ) : null}
          </EdgeMLTableHeader>
          {form.values.users.map((userName) => {
            return (
              <EdgeMLTableEntry key={userName}>
                <Group justify="space-between" m="sm" align="center">
                  <Text fw={700}>{userName}</Text>
                  <Button
                    variant="outline"
                    color="red"
                    onClick={() => handleRemoveUser(userName)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                </Group>
              </EdgeMLTableEntry>
            );
          })}
          {form.values.users.length === 0 && (
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
          onClick={handleSave}
          loading={isSaving}
        >
          Save
        </Button>
      </Group>
    </Modal>
  );
};

export default EditProjectModal;
