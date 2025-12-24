import React, { useState } from "react";
import { Button, Group, Select, Stack, Text } from "@mantine/core";
import {
  Modal,
  ModalFooter,
  ModalBody,
  ModalHeader,
} from "../../components/Common/Modal";
import CodeView from "../../components/ApiSnippetsModal/CodeView";
import {
  downloadDeploymentModel,
  downloadModalLink,
} from "../../services/ApiServices/MLDeploymentService";
import { downloadBlob } from "../../services/helpers";
import useProjectStore from "../../stores/projectStore";

const DownloadModal = ({ model, onClose }) => {
  const [language, setLanguage] = useState("cpp");
  const currentProject = useProjectStore((state) => state.currentProject);

  if (!model) {
    return null;
  }

  const downloadModel = async () => {
    if (language === "python") {
      if (!currentProject?.id) {
        return;
      }
      downloadModalLink(currentProject.id, model.id, "python");
      return;
    }

    console.log("Downloading model");
    const blob = await downloadDeploymentModel(model.id, "C");
    console.log(blob);
    downloadBlob(blob, `${model.name}_${language}.zip`);
  };

  const getCode = () => {
    switch (language) {
      case "cpp":
        return `#include "model.hpp"
#include <iostream>

int main() {
  cout << "SamplingRate: " << get_sampling_rate() << endl;
  add_datapoint(${model.timeSeries.map((elm) => "val_" + elm).join(", ")});
  int res = predict();
  cout << "Result: " << res << " <==> " << class_to_label(res) << endl;
  return 0;
}`;
      // Add cases for other languages here
      default:
        return ""; // Handle unsupported languages
    }
  };

  const CodeSnippet = ({ language, code }) => {
    const genCode = getCode();

    if (code === "") {
      return (
        <Group justify="center" align="center">
          <Text fw={600}>No sample code available</Text>
        </Group>
      );
    }

    return (
      <div>
        <Text fw={600}>Code</Text>
        <CodeView language={language} code={genCode}></CodeView>
      </div>
    );
  };

  return (
    <Modal isOpen={!!model} size="xl" onClose={onClose}>
      <ModalHeader>Download: {model.name}</ModalHeader>
      <ModalBody>
        <Group justify="space-between" align="center">
          <Group align="center">
            <Text fw={600}>Language:</Text>
            <Select
              value={language}
              onChange={(value) => value && setLanguage(value)}
              data={[{ value: "cpp", label: "C++" }]}
              allowDeselect={false}
            />
          </Group>
          <Button variant="outline" onClick={downloadModel}>
            Download
          </Button>
        </Group>
        <Stack gap="md" mt="md">
          <hr />
          <CodeSnippet language={language} code={getCode()}></CodeSnippet>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DownloadModal;
