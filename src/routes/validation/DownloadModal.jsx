import React, { useState } from "react";
import { Button, Menu, TextInput } from "@mantine/core";
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
import { getProject } from "../../services/LocalStorageService";

const DownloadModal = ({ model, onClose }) => {
  const [language, setLanguage] = useState("cpp");

  if (!model) {
    return null;
  }

  const downloadModel = async () => {
    const blob =
      language === "python"
        ? await downloadModalLink(getProject(), model._id, "python")
        : await downloadDeploymentModel(model._id, "C");
    await downloadBlob(blob, `${model.name}_${language}.zip`);
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
      default:
        return "";
    }
  };

  const CodeSnippet = ({ language, code }) => {
    const genCode = getCode();

    if (code === "") {
      return (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
          }}
        >
          No sample code available
        </div>
      );
    }

    return (
      <div>
        <b>Code</b>
        <CodeView language={language} code={genCode}></CodeView>
      </div>
    );
  };

  return (
    <Modal isOpen={model} size="xl" onClose={onClose}>
      <ModalHeader>Download: {model.name}</ModalHeader>
      <ModalBody>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <b style={{ marginRight: "0.5rem" }}>Language:</b>
            <Menu>
              <Menu.Target>
                <Button variant="outline" color="blue">
                  {language.toUpperCase()}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => setLanguage("cpp")}>C++</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
          <Button variant="outline" color="blue" onClick={downloadModel}>
            Download
          </Button>
        </div>
        <div style={{ paddingTop: "0.5rem" }}></div>
        <hr></hr>
        <CodeSnippet language={language} code={getCode()}></CodeSnippet>
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
