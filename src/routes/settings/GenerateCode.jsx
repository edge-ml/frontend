import React from "react";
import { Stack, TextInput, Button, Group, Switch, Text } from "@mantine/core";
import useDeviceApi from "../../Hooks/useDeviceAPI";
import useProjectStore from "../../stores/projectStore";

const GenerateCode = () => {
  const { currentProject } = useProjectStore();
  const { toggleDevieApi, generateApiKeys, removeApiKeys, readKey, writeKey } =
    useDeviceApi();

  const backendUrl = window.location.host;

  return (
    <Stack gap="md">
      {currentProject.users && (
        <Switch
          label="Device API"
          checked={currentProject.enableDeviceApi}
          onChange={(e) => toggleDevieApi(e.currentTarget.checked)}
        />
      )}
      {currentProject.enableDeviceApi || currentProject.users ? (
        <Stack gap="sm">
          <TextInput label="Backend-URL" value={backendUrl} readOnly />
          <TextInput
            label="Read Key"
            value={readKey || "Device-API is disabled for your user"}
            readOnly
          />
          <TextInput
            label="Write Key"
            value={writeKey || "Device-API is disabled for your user"}
            readOnly
          />
          <Group gap="sm">
            <Button
              variant="outline"
              disabled={!currentProject.enableDeviceApi}
              onClick={generateApiKeys}
            >
              Generate key
            </Button>
            <Button
              variant="outline"
              color="red"
              disabled={
                !currentProject.enableDeviceApi || !readKey || !writeKey
              }
              onClick={removeApiKeys}
            >
              Remove key
            </Button>
          </Group>
        </Stack>
      ) : (
        <Text c="dimmed" size="sm">
          Feature disabled by project admin
        </Text>
      )}
    </Stack>
  );
};

export default GenerateCode;
