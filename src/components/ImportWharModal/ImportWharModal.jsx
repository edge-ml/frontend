import React, { useEffect, useState } from "react";
import { Button, Progress, Alert, Spinner } from "reactstrap";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../Common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faLock, faCheck } from "@fortawesome/free-solid-svg-icons";

import { getWharDatasets, startWharImport } from "../../services/ApiServices/WharImportService";
import { useInterval } from "../../services/ReactHooksService";
import useWharImportStore from "../../stores/wharImportStore";
import {
  STEPS,
  stepIndex,
  isRunning,
  percentOf,
  captionOf,
} from "./wharProgressUtils";

// Small Download > Process > Upload indicator.
const StepBar = ({ state }) => {
  const active = stepIndex(state);
  return (
    <div className="d-flex mb-3">
      {STEPS.map((label, i) => {
        const done = active > i || state === "done";
        const isActive = active === i && state !== "done";
        return (
          <div key={label} className="d-flex align-items-center">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.1rem 0.55rem",
                borderRadius: "1rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                background: done ? "#e7f5ec" : isActive ? "#e7eefc" : "#f0f0f0",
                color: done ? "#1c7c43" : isActive ? "#1b4fd6" : "#888",
              }}
            >
              {done && <FontAwesomeIcon icon={faCheck} />}
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span style={{ margin: "0 0.35rem", color: "#bbb" }}>—</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ImportWharModal = ({ isOpen, onCloseModal }) => {
  const { job, status, setJob, setStatus, clear } = useWharImportStore();

  const [datasets, setDatasets] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [startError, setStartError] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Load the importable datasets when the modal opens without an active job.
  useEffect(() => {
    if (!isOpen || job) return;
    setLoadingList(true);
    setListError(null);
    getWharDatasets()
      .then((ds) => setDatasets(ds || []))
      .catch((err) => setListError(err.message || "Failed to load datasets"))
      .finally(() => setLoadingList(false));
  }, [isOpen, job]);

  // Tick for the elapsed-time display while a job runs (polling itself lives in
  // DataUpload so it keeps running with the modal closed).
  useInterval(() => setNow(Date.now()), job && isRunning(status?.state) ? 1000 : null);

  const startImport = async () => {
    if (!selected) return;
    setStartError(null);
    const ds = datasets.find((d) => d.id === selected);
    try {
      const { job_id } = await startWharImport(selected);
      setJob({ jobId: job_id, datasetName: ds ? ds.name : selected, startedAt: Date.now() });
      setStatus({ state: "queued" });
      setNow(Date.now());
    } catch (err) {
      setStartError(err.message || "Failed to start import");
    }
  };

  const running = status && isRunning(status.state);
  const done = status && status.state === "done";
  const failed = status && status.state === "error";
  const elapsed = job ? now - job.startedAt : 0;
  const pct = percentOf(status);

  const closeBackground = () => onCloseModal();
  const dismiss = () => {
    clear();
    setSelected(null);
    setStartError(null);
    onCloseModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={running ? closeBackground : dismiss} size="lg">
      <ModalHeader>Import a standard WHAR dataset</ModalHeader>
      <ModalBody>
        {!job && (
          <>
            <p className="text-muted">
              Import a published Human Activity Recognition dataset. Each dataset
              is imported as one edge-ml dataset per subject, with an activity
              labeling, ready to train on.
            </p>
            {listError && <Alert color="danger">{listError}</Alert>}
            {loadingList ? (
              <div className="text-center p-4">
                <Spinner /> Loading datasets...
              </div>
            ) : (
              <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {datasets.map((ds) => {
                  const disabled = ds.needs_credentials;
                  return (
                    <div
                      key={ds.id}
                      className={`d-flex align-items-center p-2 border-bottom ${
                        disabled ? "text-muted" : ""
                      }`}
                      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                      onClick={() => !disabled && setSelected(ds.id)}
                    >
                      <input
                        type="radio"
                        name="whar-dataset"
                        className="mr-2"
                        checked={selected === ds.id}
                        disabled={disabled}
                        readOnly
                      />
                      <div className="ml-2 flex-grow-1">
                        <b>{ds.name}</b>
                        {disabled && (
                          <span className="ml-2">
                            <FontAwesomeIcon icon={faLock} /> needs credentials
                          </span>
                        )}
                        <br />
                        <small>
                          {ds.num_of_subjects ?? "?"} subjects,{" "}
                          {ds.num_of_activities ?? "?"} activities,{" "}
                          {ds.num_of_channels ?? "?"} channels
                          {ds.sampling_freq ? `, ${ds.sampling_freq} Hz` : ""}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {startError && (
              <Alert color="danger" className="mt-3">
                {startError}
              </Alert>
            )}
          </>
        )}

        {job && (
          <div className="p-2">
            <div className="mb-2">
              Importing <b>{job.datasetName}</b>
            </div>
            <StepBar state={status ? status.state : "queued"} />
            {(running || !status) && (
              <>
                <Progress
                  animated
                  striped={pct == null}
                  value={pct == null ? 100 : pct}
                >
                  {pct == null ? "" : `${pct}%`}
                </Progress>
                <small className="text-muted">{captionOf(status, elapsed)}</small>
              </>
            )}
            {done && (
              <Alert color="success">
                <FontAwesomeIcon icon={faCheckCircle} /> Imported{" "}
                {status.created_dataset_ids ? status.created_dataset_ids.length : 0}{" "}
                datasets. They now appear in your datasets list.
              </Alert>
            )}
            {failed && (
              <Alert color="danger">{status.error || "Import failed"}</Alert>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {!job && (
          <>
            <Button color="secondary" onClick={dismiss}>
              Cancel
            </Button>
            <Button color="primary" disabled={!selected} onClick={startImport}>
              Import
            </Button>
          </>
        )}
        {job && running && (
          <Button color="secondary" onClick={closeBackground}>
            Close (import keeps running)
          </Button>
        )}
        {job && (done || failed) && (
          <Button color="primary" onClick={dismiss}>
            Close
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ImportWharModal;
