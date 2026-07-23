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
import { faFile } from "@fortawesome/free-regular-svg-icons";
import { DatasetConfigView } from "./DatasetConfigView";

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
        <FontAwesomeIcon icon={faFile} size="2x" />
        <span>{file.name}</span>
      </div>
      <div className="file-progress">
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
        <div className="file-status-text">
          {file.status === FileStatus.ERROR
            ? `Error: ${file.error}`
            : `${file.status}${
                file.status === FileStatus.PROCESSING
                  ? file.processedTimeseries[0]
                    ? `: ${file.processingStep} - Timeseries Processed: ${file.processedTimeseries[0]}/${file.processedTimeseries[1]}`
                    : `: ${file.processingStep}`
                  : ""
              } \u00b7 ${file.progress.toFixed(0)}%`}
        </div>
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
        {file.status === FileStatus.UPLOADING && (
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
        {file.status === FileStatus.PROCESSING && (
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
