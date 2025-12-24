import React, { useState } from "react";
import { Button, Group, Stack, Switch, Text, TextInput } from "@mantine/core";
import useDeviceApi from "../../Hooks/useDeviceAPI";
import useProjectStore from "../../stores/projectStore";

const GenerateCode = (props) => {
  const { currentProject } = useProjectStore();
  const { toggleDevieApi, generateApiKeys, removeApiKeys, readKey, writeKey } =
    useDeviceApi();
  const [isToggling, setIsToggling] = useState(false);

  const backendUrl = window.location.host;
  const deviceApiEnabled = !!currentProject.enable_external_api;
  const handleToggleDeviceApi = async (e) => {
    e.preventDefault();
    if (isToggling) {
      return;
    }

    const nextState = !currentProject.enable_external_api;
    setIsToggling(true);
    try {
      await toggleDevieApi(nextState);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Stack gap="md">
      {currentProject.users ? (
        <Switch
          label="Device API"
          checked={currentProject.enable_external_api}
          onChange={handleToggleDeviceApi}
          disabled={isToggling}
        />
      ) : null}
      {currentProject.enable_external_api || currentProject.users ? (
        <Stack gap="sm">
          <TextInput label="Backend-URL" value={backendUrl} readOnly />
          <TextInput
            label="Read Key"
            disabled={!deviceApiEnabled}
            value={
              readKey
                ? readKey
                : deviceApiEnabled
                  ? "No read key available"
                  : "Device-API is disabled for your user"
            }
            readOnly
          />
          <TextInput
            label="Write Key"
            disabled={!deviceApiEnabled}
            value={
              writeKey
                ? writeKey
                : deviceApiEnabled
                  ? "No write key available"
                  : "Device-API is disabled for your user"
            }
            readOnly
          />
          <Group>
            <Button
              disabled={!currentProject.enable_external_api}
              onClick={generateApiKeys}
            >
              {props.state ? "Change key" : "Generate key"}
            </Button>
            <Button
              variant="outline"
              color="red"
              disabled={
                !currentProject.enable_external_api || !readKey || !writeKey
              }
              onClick={removeApiKeys}
            >
              Remove key
            </Button>
          </Group>
        </Stack>
      ) : (
        <Text>Feature disabled by project admin</Text>
      )}
    </Stack>
  );
};

export default GenerateCode;
