import React, { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  Modal,
  ModalFooter,
  ModalBody,
  ModalHeader,
} from "../../components/Common/Modal";
import CodeView from "../../components/ApiSnippetsModal/CodeView";
import { downloadDeploymentModel } from "../../services/ApiServices/MLDeploymentService";
import { downloadBlob } from "../../services/helpers";

const FORMAT_INFO = {
  C: { label: "C++", prismLanguage: "cpp" },
  EXECUTORCH: { label: "ExecuTorch (.pte)", prismLanguage: "kotlin" },
};

const DownloadModal = ({ model, onClose }) => {
  // formats is computed by the backend at train time; older models predate it
  const formats =
    model && model.formats && model.formats.length ? model.formats : ["C"];
  const [format, setFormat] = useState(formats[0]);
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);

  if (!model) {
    return null;
  }

  const formatInfo = FORMAT_INFO[format] || { label: format, prismLanguage: "c" };

  const downloadModel = async () => {
    const blob = await downloadDeploymentModel(model._id, format);
    downloadBlob(blob, `${model.name}_${format.toLowerCase()}.zip`);
  };

  const getCode = () => {
    switch (format) {
      case "C":
        return `#include "model.hpp"
#include <iostream>

int main() {
  cout << "SamplingRate: " << get_sampling_rate() << endl;
  add_datapoint(${model.timeSeries.map((elm) => "val_" + elm).join(", ")});
  int res = predict();
  cout << "Result: " << res << " <==> " << class_to_label(res) << endl;
  return 0;
}`;
      case "EXECUTORCH":
        return `// Android (Kotlin) — see README.md and manifest.json in the download
val classifier = ExampleClassifier("model.pte")

// call once per sensor sample (order: ${model.timeSeries.join(", ")})
classifier.addDatapoint(floatArrayOf(${model.timeSeries
          .map((elm) => "val_" + elm)
          .join(", ")}))

val label = classifier.predict()`;
      default:
        return ""; // Handle unsupported formats
    }
  };

  const CodeSnippet = ({ code }) => {
    if (code === "") {
      return (
        <div className="d-flex w-100 justify-content-center align-items-center mh-25 fw-bold">
          No sample code available
        </div>
      );
    }

    return (
      <div>
        <b>Code</b>
        <CodeView language={formatInfo.prismLanguage} code={code}></CodeView>
      </div>
    );
  };

  return (
    <Modal isOpen={model} size="xl" onClose={onClose}>
      <ModalHeader>Download: {model.name}</ModalHeader>
      <ModalBody>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <b className="me-2">Format:</b>
            <Dropdown
              isOpen={formatDropdownOpen}
              toggle={() => setFormatDropdownOpen(!formatDropdownOpen)}
            >
              <DropdownToggle outline color="primary" caret>
                {formatInfo.label}
              </DropdownToggle>
              <DropdownMenu>
                {formats.map((fmt) => (
                  <DropdownItem key={fmt} onClick={() => setFormat(fmt)}>
                    {(FORMAT_INFO[fmt] || { label: fmt }).label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <Button outline color="primary" onClick={downloadModel}>
            Download
          </Button>
        </div>
        <div className="pt-2"></div>
        <hr></hr>
        <CodeSnippet code={getCode()}></CodeSnippet>
      </ModalBody>
      <ModalFooter>
        <Button outline onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DownloadModal;
