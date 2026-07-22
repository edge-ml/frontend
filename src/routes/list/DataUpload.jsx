import React, { useState } from "react";
import { SimpleGrid, Card, Text, Button, Group } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faFile,
  faMicrochip,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";
import useProjectRouter from "../../Hooks/ProjectRouter";
import { UploadDatasetModal } from "../../components/UploadDatasetModal/UploadDatasetModal";

const DataUpload = ({ refreshDatasets }) => {
  const navigate = useProjectRouter();
  const [csvModalOpen, setCSVModalOpen] = useState(false);

  const dataUploadOptions = [
    {
      icon: faMicrochip,
      title: "WebBLE Direct Connect",
      description: (
        <>
          Learn how to prepare your Arduino{" "}
          <a
            href="https://github.com/edge-ml/EdgeML-Arduino"
            target="_blank"
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
            target="_blank"
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
    <div
      className="p-4 pt-4 pb-5 mb-4"
      style={{
        background: "linear-gradient(rgb(26, 32, 44), rgb(45, 55, 72))",
      }}
    >
      <Text c="white" opacity={0.7} fw={700} mb="md">
        DATA UPLOAD
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {dataUploadOptions.map((option, index) => (
          <Card
            key={index}
            padding="md"
            style={{ background: "transparent", color: "white" }}
          >
            <Group gap="sm" align="flex-start">
              <FontAwesomeIcon icon={option.icon} />
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={700}>
                  {option.title}
                </Text>
                <Text size="xs">{option.description}</Text>
                <Button
                  id={`buttonUpload${option.title.replace(/ /g, "")}`}
                  variant="outline"
                  color="gray"
                  size="compact-sm"
                  mt="sm"
                  onClick={option.buttonAction}
                >
                  {option.buttonText}
                </Button>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <UploadDatasetModal
        isOpen={csvModalOpen}
        onCloseModal={() => setCSVModalOpen(false)}
        onDatasetComplete={refreshDatasets}
      />
    </div>
  );
};

export default DataUpload;
