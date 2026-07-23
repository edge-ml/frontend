import React, { useState } from "react";
import { SimpleGrid, Text, Button, Group, ThemeIcon } from "@mantine/core";
import { IconBluetooth, IconFileUpload, IconCode, IconDeviceMobile } from "@tabler/icons-react";
import useProjectRouter from "../../Hooks/ProjectRouter";
import { UploadDatasetModal } from "../../components/UploadDatasetModal/UploadDatasetModal";

const DataUpload = ({ refreshDatasets }) => {
  const navigate = useProjectRouter();
  const [csvModalOpen, setCSVModalOpen] = useState(false);

  const dataUploadOptions = [
    {
      icon: IconBluetooth,
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
      icon: IconFileUpload,
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
      icon: IconCode,
      title: "Library Upload",
      description: "Implement custom logic using edge-ml libraries.",
      buttonText: "Generate Code",
      buttonAction: () => navigate("settings/getCode"),
    },
    {
      icon: IconDeviceMobile,
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
        background: "linear-gradient(135deg, rgb(20, 30, 48), rgb(36, 48, 68))",
      }}
    >
      <Text c="white" opacity={0.7} fw={700} mb="md">
        DATA UPLOAD
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {dataUploadOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Group key={index} gap="sm" align="flex-start" wrap="nowrap">
              <ThemeIcon
                size="lg"
                variant="light"
                color="green"
                style={{ backgroundColor: "rgba(64, 192, 87, 0.15)", color: "#40C057", flexShrink: 0 }}
              >
                <Icon size={20} />
              </ThemeIcon>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={700} mb={4} c="white">
                  {option.title}
                </Text>
                <Text size="xs" c="gray.4">
                  {option.description}
                </Text>
                <Button
                  id={`buttonUpload${option.title.replace(/ /g, "")}`}
                  variant="outline"
                  color="green"
                  size="compact-sm"
                  mt="sm"
                  onClick={option.buttonAction}
                >
                  {option.buttonText}
                </Button>
              </div>
            </Group>
          );
        })}
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
