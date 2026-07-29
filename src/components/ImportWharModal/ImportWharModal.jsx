import React, { useEffect, useState } from "react";
import { Button, Progress, Alert, Spinner } from "reactstrap";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../Common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faLock } from "@fortawesome/free-solid-svg-icons";

import {
  getWharDatasets,
  startWharImport,
  getWharImportStatus,
} from "../../services/ApiServices/WharImportService";
import { useInterval } from "../../services/ReactHooksService";

// States reported by the import job (mirrors the whar-import backend).
const isRunning = (state) =>
  ["queued", "downloading", "converting", "uploading"].includes(state);

const STATE_LABEL = {
  queued: "Queued",
  downloading: "Downloading and parsing (this can take a few minutes)",
  converting: "Converting to edge-ml format",
  uploading: "Uploading datasets",
  done: "Done",
  error: "Failed",
};

export const ImportWharModal = ({ isOpen, onCloseModal, onDatasetComplete }) => {
  const [datasets, setDatasets] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);
  const [selected, setSelected] = useState(null);

  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [startError, setStartError] = useState(null);

  // Load the list of importable datasets when the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setLoadingList(true);
    setListError(null);
    getWharDatasets()
      .then((ds) => setDatasets(ds || []))
      .catch((err) => setListError(err.message || "Failed to load datasets"))
      .finally(() => setLoadingList(false));
  }, [isOpen]);

  // Poll the job status while an import is running.
  useInterval(
    async () => {
      try {
        const s = await getWharImportStatus(jobId);
        setStatus(s);
        if (s.state === "done") {
          onDatasetComplete && onDatasetComplete();
        }
      } catch (err) {
        setStatus({ state: "error", error: err.message });
      }
    },
    jobId && status && isRunning(status.state) ? 2000 : null
  );

  const resetAndClose = () => {
    setSelected(null);
    setJobId(null);
    setStatus(null);
    setStartError(null);
    onCloseModal();
  };

  const startImport = async () => {
    if (!selected) return;
    setStartError(null);
    try {
      const { job_id } = await startWharImport(selected);
      setJobId(job_id);
      setStatus({ state: "queued", subjects_done: 0, subjects_total: null });
    } catch (err) {
      setStartError(err.message || "Failed to start import");
    }
  };

  const running = status && isRunning(status.state);
  const done = status && status.state === "done";
  const failed = status && status.state === "error";

  const progressValue =
    status && status.subjects_total
      ? Math.round((status.subjects_done / status.subjects_total) * 100)
      : running
        ? 100
        : 0;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} size="lg">
      <ModalHeader>Import a standard WHAR dataset</ModalHeader>
      <ModalBody>
        {!jobId && (
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

        {jobId && (
          <div className="p-2">
            <div className="mb-2">
              <b>{STATE_LABEL[status.state] || status.state}</b>
            </div>
            {running && (
              <Progress
                animated
                value={progressValue}
                striped={!status.subjects_total}
              >
                {status.subjects_total
                  ? `${status.subjects_done}/${status.subjects_total} subjects`
                  : ""}
              </Progress>
            )}
            {done && (
              <Alert color="success">
                <FontAwesomeIcon icon={faCheckCircle} /> Imported{" "}
                {status.created_dataset_ids
                  ? status.created_dataset_ids.length
                  : 0}{" "}
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
        {!jobId && (
          <>
            <Button color="secondary" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button color="primary" disabled={!selected} onClick={startImport}>
              Import
            </Button>
          </>
        )}
        {jobId && (
          <Button
            color={done || failed ? "primary" : "secondary"}
            onClick={resetAndClose}
          >
            {done || failed ? "Close" : "Close (import continues)"}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ImportWharModal;
