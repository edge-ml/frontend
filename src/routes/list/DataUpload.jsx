// Import necessary libraries and components
import React, { useState } from "react";
import { Box, Button, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faFile,
  faMicrochip,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";
import useProjectRouter from "../../Hooks/ProjectRouter";
import { UploadDatasetModal } from "../../components/UploadDatasetModal/UploadDatasetModal";

// Component for Data Upload Panel
const DataUpload = ({ refreshDatasets }) => {
  const navigate = useProjectRouter();

  const [csvModalOpen, setCSVModalOpen] = useState(false);

  const iconSize = "xs";
  const linkTarget = "_blank";

  const dataUploadOptions = [
    {
      icon: faMicrochip,
      title: "WebBLE Direct Connect",
      description: (
        <>
          Learn how to prepare your Arduino{" "}
          <a
            href="https://github.com/edge-ml/EdgeML-Arduino"
            target={linkTarget}
            rel="noreferrer"
          >
            here
          </a>
          .
        </>
      ),
      buttonText: "Connect BLE Device",
      buttonAction: () => navigate("ble"),
    },
    {
      icon: faFile,
      title: "CSV File Upload",
      description: (
        <>
          Learn how to prepare your CSV file{" "}
          <a
            href="https://github.com/edge-ml/EdgeML-Arduino"
            target={linkTarget}
            rel="noreferrer"
          >
            here
          </a>
          .
        </>
      ),
      buttonText: "Upload CSV Files",
      buttonAction: () => setCSVModalOpen(true),
    },
    {
      icon: faCode,
      title: "Library Upload",
      description: "Implement custom logic using edge-ml libraries.",
      buttonText: "Generate Code",
      buttonAction: () => navigate("settings/getCode"),
    },
    {
      icon: faMobileAlt,
      title: "Web Sensor API",
      description: "Collect sensor data from a smartphone in a browser.",
      buttonText: "Collect Web Sensor Data",
      buttonAction: () => navigate("uploadWeb"),
    },
  ];

  return (
    <Box
      className="p-4 pt-4 pb-5 mb-4 data-upload-panel"
      style={{
        background: "linear-gradient(rgb(26, 32, 44), rgb(45, 55, 72))",
      }}
    >
      <Text className="mt-2 mb-4" style={{ color: "white", opacity: 0.7 }}>
        <b>DATA UPLOAD</b>
      </Text>

      {/* Render the Data Upload options */}
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="lg">
        {dataUploadOptions.map((option, index) => (
          <Group
            h="100%"
            key={index}
            align="stretch"
            wrap="nowrap"
            className="p-3"
            style={{ color: "white"}}
          >
            <Box className="data-upload-icon">
              <FontAwesomeIcon icon={option.icon} size={iconSize} />
            </Box>
            <Stack gap={8} justify="space-between" style={{ flex: 1 }}>
              <Text size="sm">
                <b>{option.title}</b>
                <br />
                {option.description}
              </Text>
              <Button
                id={`buttonUpload${option.title.replace(/ /g, "")}`}
                className="mt-2 btn-upload"
                color="dark"
                variant="white"
                size="xs"
                onClick={option.buttonAction}
                mt="auto"
              >
                <Text size="sm">{option.buttonText}</Text>
              </Button>
            </Stack>
          </Group>
        ))}
      </SimpleGrid>
      <UploadDatasetModal
        isOpen={csvModalOpen}
        onCloseModal={() => setCSVModalOpen(false)}
        onDatasetComplete={refreshDatasets}
      />
    </Box>
  );
};

export default DataUpload;
