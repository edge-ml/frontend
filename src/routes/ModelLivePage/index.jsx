import React, { useEffect, useState } from "react";
import { Box, Group, Notification, Stack, Text, Title } from "@mantine/core";
import { getModel } from "../../services/ApiServices/MlService";
import Loader from "../../modules/loader";
import SetUpBLEConnection from "./SetUpBLEConnection";
import LivePage from "./LivePage";
import LabelBadge from "../../components/Common/LabelBadge";

const ModelLivePage = ({ model_id }) => {
  const [model, setModel] = useState(undefined);
  const [bleDevice, setbleDevice] = useState(undefined);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    getModel(model_id).then((model) => {
      setModel(model);
    });
  }, []);

  const onDeviceDisconnect = () => {
    setBLEDevice(undefined);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const setBLEDevice = (bleDevice) => {
    setbleDevice(bleDevice);
  };

  if (!model) {
    return <Loader loading></Loader>;
  }
  return (
    <>
      {toastVisible ? (
        <Box style={{ position: "absolute", bottom: 0, width: "100%" }}>
          <Group justify="center">
            <Notification color="red" title="Warning!">
              Device disconnected!
            </Notification>
          </Group>
        </Box>
      ) : null}
      <Box style={{ height: "100vh" }}>
        <Stack px="md" py="md" gap="md">
          <Title order={4}>LIVE MODEL</Title>
          <Stack gap="sm">
            <Text size="lg">
              <b>Use model:</b> {model.name}
            </Text>
            <Group align="center" wrap="wrap">
              <Text size="lg">
                <b>Labels in the model: </b>
              </Text>
              {model.labels.map((elm) => (
                <LabelBadge
                  key={elm.id}
                  color={elm.color}
                  style={{ margin: 4 }}
                >
                  {elm.name}
                </LabelBadge>
              ))}
            </Group>
          </Stack>
          {bleDevice ? (
            <LivePage bleDevice={bleDevice} model={model}></LivePage>
          ) : (
            <SetUpBLEConnection
              model={model}
              setBLEDevice={setBLEDevice}
              onDeviceDisconnect={onDeviceDisconnect}
            ></SetUpBLEConnection>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default ModelLivePage;
