import React from "react";
import { Stack, Card, Text, Title } from "@mantine/core";
import EditName from "./EditName";
import DeleteProject from "./DeleteProject";
import GenerateCode from "./GenerateCode";
import UserEdit from "./UserEdit";

const Settings = () => {
  return (
    <Stack p="md" gap="lg">
      <Title order={3}>Settings</Title>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text fw={700} size="lg" mb="md">
          Edit Project Name
        </Text>
        <EditName />
      </Card>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text fw={700} size="lg" mb="md">
          Delete Project
        </Text>
        <DeleteProject />
      </Card>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text fw={700} size="lg" mb="md">
          Device API
        </Text>
        <GenerateCode />
      </Card>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text fw={700} size="lg" mb="md">
          Edit Users
        </Text>
        <UserEdit />
      </Card>
    </Stack>
  );
};

export default Settings;
