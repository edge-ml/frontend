import React from "react";
import { Button, Progress } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrashAlt,
  faCog,
  faCheckCircle,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import { faFile, faFileLines } from "@fortawesome/free-regular-svg-icons";
import { faVideo, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { formatSize } from "../../routes/dataset/media/mediaUtils";

const KIND_ICONS = { csv: faFileLines, video: faVideo, audio: faVolumeHigh };
const KIND_NAMES = { csv: "Sensor data (CSV)", video: "Video", audio: "Audio" };
import { DatasetConfigView } from "./DatasetConfigView";

// "2 of 3 time-series have a unit", so units are visible before opening the
// settings. A series counts once its quantity is set (catalog or custom).
const UnitSummary = ({ config, onOpen }) => {
  const series = (config?.timeSeries || []).filter((ts) => !ts.removed);
  if (!series.length) return null;
  const set = series.filter((ts) => ts.quantity).length;
  const text =
    set === 0
      ? `Units not set for ${series.length} time-series`
      : set === series.length
        ? series.length === 1
          ? "Unit set"
          : `Units set for all ${series.length} time-series`
        : `Units set for ${set} of ${series.length} time-series`;
  return (
    <div className="file-unit-summary">
      <span>{text}</span>
      <button type="button" className="file-unit-link" onClick={onOpen}>
        {set === series.length ? "Edit units" : "Set units"}
      </button>
    </div>
  );
};

export const FileListItem = ({
  file,
  onDelete,
  onCancel,
  changeConfig,
  FileStatus,
}) => {
  if (file.config && file.config.editingModeActive) {
    return (
      <DatasetConfigView
        fileId={file.id}
        fileConfig={file.config}
        changeConfig={changeConfig}
        backendId={file.backendId}
      />
    );
  }

  return (
    <div className="file-item">
      <div className="file-icon-wrapper">
        <FontAwesomeIcon icon={KIND_ICONS[file.kind] ?? faFile} size="2x" />
      </div>
      <div className="file-progress">
        <div className="file-name">
          <span className="file-name__text">{file.name}</span>
          <span className="file-name__kind">
            {[KIND_NAMES[file.kind], formatSize(file.size)].filter(Boolean).join(" · ")}
          </span>
        </div>
        <Progress
          value={file.progress}
          color={
            file.status === FileStatus.COMPLETE
              ? "green"
              : file.status === FileStatus.ERROR ||
                  file.status === FileStatus.CANCELLED
                ? "red"
                : "green"
          }
          size="lg"
          radius="md"
        />
        <div
          className={`file-status-text ${
            file.status === FileStatus.ERROR ? "file-status-text--error" : ""
          }`}
          title={file.error || file.note}
        >
          {file.status === FileStatus.ERROR || file.status === FileStatus.CANCELLED
            ? file.error
            : file.status === FileStatus.UPLOADING
              ? `Uploading · ${file.progress.toFixed(0)}%`
              : file.status === FileStatus.PROCESSING
                ? file.kind === "csv"
                  ? "Reading the data…"
                  : "Checking the file…"
                : file.status === FileStatus.COMPLETE
                  ? file.note || "Done"
                  : "Ready"}
        </div>
        {file.status === FileStatus.CONFIGURATION && file.kind === "csv" && (
          <UnitSummary
            config={file.config}
            onOpen={() =>
              changeConfig(file.id, { ...file.config, editingModeActive: true })
            }
          />
        )}
      </div>
      <div className="file-actions">
        {file.status === FileStatus.COMPLETE && (
          <Button variant="subtle" size="sm" onClick={() => onDelete(file.id)}>
            <FontAwesomeIcon
              icon={faCheckCircle}
              style={{ color: "#47bb78", fontSize: "1.2em" }}
              title="Removes item from list"
            />
          </Button>
        )}
        {file.status === FileStatus.CONFIGURATION && (
          <>
            {file.kind === "csv" ? (
            <div
              className="file-action-btn"
              title="Opens configuration menu"
              onClick={() =>
                changeConfig(file.id, {
                  ...file.config,
                  editingModeActive: true,
                })
              }
            >
              <FontAwesomeIcon icon={faCog} style={{ fontSize: "1.2em" }} />
            </div>
            ) : null}
            <div
              className="file-action-btn file-action-btn--danger"
              title="Removes item from list"
              onClick={() => onDelete(file.id)}
            >
              <FontAwesomeIcon
                icon={faTrashAlt}
                style={{ fontSize: "1.2em" }}
              />
            </div>
          </>
        )}
        {(file.status === FileStatus.UPLOADING ||
          (file.status === FileStatus.PROCESSING && file.cancellationHandler)) && (
          <div
            className="file-action-btn file-action-btn--danger"
            title="Cancels ongoing upload"
            onClick={() => onCancel(file)}
          >
            <FontAwesomeIcon icon={faBan} style={{ fontSize: "1.2em" }} />
          </div>
        )}
        {(file.status === FileStatus.CANCELLED ||
          file.status === FileStatus.ERROR) && (
          <Button
            variant="subtle"
            size="sm"
            title="Removes item from list"
            onClick={() => onDelete(file.id)}
          >
            <FontAwesomeIcon
              icon={faTrashAlt}
              style={{ color: "#fa5252", fontSize: "1.2em" }}
            />
          </Button>
        )}
        {file.status === FileStatus.PROCESSING && !file.cancellationHandler && (
          <FontAwesomeIcon
            spin
            size="lg"
            style={{ color: "#47bb78", marginLeft: "0.25rem" }}
            icon={faSpinner}
          />
        )}
      </div>
    </div>
  );
};
