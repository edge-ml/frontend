import React, { useState, useEffect } from "react";
import { Button, Menu } from "@mantine/core";
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

const formatInfoFor = (fmt) =>
  FORMAT_INFO[fmt] || { label: fmt, prismLanguage: "c" };

// null/undefined => legacy model trained before the backend computed formats,
// so fall back to C++. An explicit empty array means the pipeline supports no
// download format and the download must be disabled.
const formatsFor = (model) =>
  model && model.formats == null ? ["C"] : (model && model.formats) || [];

const DownloadModal = ({ model, onClose }) => {
  const [format, setFormat] = useState(null);
  const [error, setError] = useState(null);

  const formats = formatsFor(model);

  // The modal is mounted continuously with model=null and only later receives a
  // real model, so the selection has to be (re)initialised on model change
  // rather than in the useState initialiser.
  useEffect(() => {
    setFormat(formats.length ? formats[0] : null);
    setError(null);
  }, [model && model._id]);

  if (!model) {
    return null;
  }

  const info = format ? formatInfoFor(format) : null;
  const timeSeries = model.timeSeries || [];

  const downloadModel = async () => {
    try {
      setError(null);
      const blob = await downloadDeploymentModel(model._id, format);
      downloadBlob(blob, `${model.name}_${format.toLowerCase()}.zip`);
    } catch (e) {
      setError(
        e && e.message ? e.message : "Download failed. Please try again."
      );
    }
  };

  const getCode = () => {
    switch (format) {
      case "C":
        return `#include "model.hpp"
#include <iostream>

int main() {
  cout << "SamplingRate: " << get_sampling_rate() << endl;
  add_datapoint(${timeSeries.map((elm) => "val_" + elm).join(", ")});
  int res = predict();
  cout << "Result: " << res << " <==> " << class_to_label(res) << endl;
  return 0;
}`;
      case "EXECUTORCH":
        return `// Android (Kotlin) — see README.md and manifest.json in the download
val classifier = ExampleClassifier("model.pte")

// call once per sensor sample (order: ${timeSeries.join(", ")})
classifier.addDatapoint(floatArrayOf(${timeSeries
          .map((elm) => "val_" + elm)
          .join(", ")}))

val label = classifier.predict()`;
      default:
        return "";
    }
  };

  const code = getCode();

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
            <b style={{ marginRight: "0.5rem" }}>Format:</b>
            {format ? (
              <Menu>
                <Menu.Target>
                  <Button variant="outline" color="blue">
                    {info.label}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {formats.map((fmt) => (
                    <Menu.Item key={fmt} onClick={() => setFormat(fmt)}>
                      {formatInfoFor(fmt).label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            ) : (
              <span style={{ color: "#868e96" }}>
                No export format available for this model
              </span>
            )}
          </div>
          <Button
            variant="outline"
            color="blue"
            onClick={downloadModel}
            disabled={!format}
          >
            Download
          </Button>
        </div>
        <div style={{ paddingTop: "0.5rem" }}></div>
        <hr></hr>
        {error && (
          <div style={{ color: "#c92a2a", fontWeight: 700, marginBottom: "0.5rem" }}>
            {error}
          </div>
        )}
        {code === "" ? (
          <div
            style={{
              display: "flex",
              width: "100%",
              minHeight: "12rem",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 700,
            }}
          >
            No sample code available
          </div>
        ) : (
          <div>
            <b>Code</b>
            <CodeView language={info.prismLanguage} code={code}></CodeView>
          </div>
        )}
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
