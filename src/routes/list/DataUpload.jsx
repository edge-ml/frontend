// Import necessary libraries and components
import React, { useState } from "react";
import { Button, Row, Col, Progress, Spinner } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faFile,
  faMicrochip,
  faMobileAlt,
  faDatabase,
  faCheckCircle,
  faTimes,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import useProjectRouter from "../../Hooks/ProjectRouter";
import { UploadDatasetModal } from "../../components/UploadDatasetModal/UploadDatasetModal";
import { ImportWharModal } from "../../components/ImportWharModal/ImportWharModal";
import { getWharImportStatus } from "../../services/ApiServices/WharImportService";
import { useInterval } from "../../services/ReactHooksService";
import useWharImportStore from "../../stores/wharImportStore";
import {
  isRunning,
  percentOf,
  captionOf,
} from "../../components/ImportWharModal/wharProgressUtils";

// Compact banner shown whenever a WHAR import is active, even with the modal
// closed, so a long import never looks like it just vanished. Click to reopen.
const WharImportBadge = ({ job, status, elapsed, onOpen, onDismiss }) => {
  const state = status ? status.state : "queued";
  const running = isRunning(state);
  const done = state === "done";
  const failed = state === "error";
  const pct = percentOf(status);
  return (
    <div
      className="mb-3 p-2 d-flex align-items-center"
      style={{ background: "#fff", borderRadius: "0.5rem", color: "#222", gap: "0.75rem" }}
    >
      {running && <Spinner size="sm" />}
      {done && <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#1c7c43" }} />}
      {failed && <FontAwesomeIcon icon={faCircleExclamation} style={{ color: "#c0392b" }} />}
      <div
        className="flex-grow-1"
        style={{ cursor: "pointer" }}
        onClick={onOpen}
        role="button"
      >
        <div style={{ fontSize: "0.82rem" }}>
          <b>{job.datasetName}</b>{" "}
          <span className="text-muted">
            {done ? "imported" : failed ? "failed" : captionOf(status, elapsed)}
          </span>
        </div>
        {running && (
          <Progress
            className="mt-1"
            style={{ height: "6px" }}
            animated
            striped={pct == null}
            value={pct == null ? 100 : pct}
          />
        )}
      </div>
      {running && (
        <Button size="sm" color="light" onClick={onOpen}>
          View
        </Button>
      )}
      {(done || failed) && (
        <Button size="sm" color="link" onClick={onDismiss} title="Dismiss">
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      )}
    </div>
  );
};

// Component for Data Upload Panel
const DataUpload = ({ refreshDatasets }) => {
  const navigate = useProjectRouter();

  const [csvModalOpen, setCSVModalOpen] = useState(false);
  const [wharModalOpen, setWharModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  const { job, status, setStatus, clear } = useWharImportStore();

  // Poll the active import (keeps running with the modal closed); refresh the
  // datasets list once it completes.
  useInterval(
    async () => {
      if (!job) return;
      try {
        const s = await getWharImportStatus(job.jobId);
        setStatus(s);
        if (s.state === "done") refreshDatasets && refreshDatasets();
      } catch (err) {
        setStatus({ state: "error", error: err.message });
      }
    },
    job && (!status || isRunning(status.state)) ? 2000 : null
  );

  // Tick elapsed while a job runs.
  useInterval(() => setNow(Date.now()), job && isRunning(status?.state) ? 1000 : null);

  const iconSize = "xs";
  const buttonColor = "secondary";
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
    {
      icon: faDatabase,
      title: "Standard WHAR Dataset",
      description:
        "Import a published Human Activity Recognition dataset to train on.",
      buttonText: "Import WHAR Dataset",
      buttonAction: () => setWharModalOpen(true),
    },
  ];

  return (
    <div
      className="p-4 pt-4 pb-5 mb-4 data-upload-panel"
      style={{
        background: "linear-gradient(rgb(26, 32, 44), rgb(45, 55, 72))",
      }}
    >
      <div className="mt-2 mb-4" style={{ color: "white", opacity: 0.7 }}>
        <b>DATA UPLOAD</b>
      </div>

      {job && (
        <WharImportBadge
          job={job}
          status={status}
          elapsed={now - job.startedAt}
          onOpen={() => setWharModalOpen(true)}
          onDismiss={clear}
        />
      )}

      {/* Render the Data Upload options */}
      <Row>
        {dataUploadOptions.map((option, index) => (
          <Col
            key={index}
            className="col-sm-6 col-xl-3 col-12 p-3 d-flex flex-row align-items-start justify-content-start"
            style={{ color: "white" }}
          >
            <div className="data-upload-icon">
              <FontAwesomeIcon icon={option.icon} size={iconSize} />
            </div>
            <div className="w-100 h-100 d-flex flex-column align-items-start justify-content-between">
              <div>
                <small>
                  <b>{option.title}</b>
                  <br />
                  {option.description}
                </small>
              </div>
              <Button
                id={`buttonUpload${option.title.replace(/ /g, "")}`}
                className="mt-2 btn-upload align-self-stretch align-self-md-start"
                color={buttonColor}
                onClick={option.buttonAction}
                style={{ padding: "0px" }}
              >
                <small>{option.buttonText}</small>
              </Button>
            </div>
          </Col>
        ))}
      </Row>
      <UploadDatasetModal
        isOpen={csvModalOpen}
        onCloseModal={() => setCSVModalOpen(false)}
        onDatasetComplete={refreshDatasets}
      />
      <ImportWharModal
        isOpen={wharModalOpen}
        onCloseModal={() => setWharModalOpen(false)}
      />
    </div>
  );
};

export default DataUpload;
