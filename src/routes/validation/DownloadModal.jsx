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
  C: { label: "Embedded · C++", prismLanguage: "cpp" },
  EXECUTORCH: { label: "Mobile · ExecuTorch (.pte)", prismLanguage: "kotlin" },
  PYTORCH: { label: "Server · PyTorch (.pt)", prismLanguage: "python" },
  ONNX: { label: "Browser · ONNX (JavaScript)", prismLanguage: "javascript" },
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
      case "PYTORCH":
        return `# Python (server / desktop) — see README.md and inference.py in the download
import torch, numpy as np

model = torch.jit.load("model.pt")   # preprocessing is baked in
model.eval()

# one raw window: (batch, window_size, num_sensors=${timeSeries.length})
window = np.zeros((1, WINDOW_SIZE, ${timeSeries.length}), dtype=np.float32)
logits = model(torch.from_numpy(window))
label = int(torch.argmax(logits, dim=-1))`;
      case "ONNX":
        return `// Browser or Node.js with the edge-ml library — see README.md and index.html in the download
// <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"></script>
// <script src="https://unpkg.com/edge-ml"></script>
const predictor = await edgeML.OnnxPredictor.fromUrls("model.onnx", "manifest.json");

// call once per sensor sample (preprocessing is baked into the model)
predictor.addSample({ ${timeSeries.map((elm) => `"${elm}": val_${elm}`).join(", ")} });

const { prediction } = await predictor.predict();`;
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
