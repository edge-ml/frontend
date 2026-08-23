import React, { useState } from "react";
import { SimpleGrid, Text, Button, Group, ThemeIcon, Progress, Loader } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faCheckCircle,
  faTimes,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  IconBluetooth,
  IconFileUpload,
  IconCode,
  IconDeviceMobile,
} from "@tabler/icons-react";
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
      {running && <Loader size="xs" />}
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
            size="sm"
            animated={pct == null}
            value={pct == null ? 100 : pct}
          />
        )}
      </div>
      {running && (
        <Button size="compact-sm" variant="default" onClick={onOpen}>
          View
        </Button>
      )}
      {(done || failed) && (
        <Button
          size="compact-sm"
          variant="subtle"
          color="gray"
          onClick={onDismiss}
          title="Dismiss"
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      )}
    </div>
  );
};

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

  const dataUploadOptions = [
    {
      icon: IconBluetooth,
      title: "WebBLE Direct Connect",
      description: (
        <>
          Learn how to prepare your Arduino{" "}
          <a
            href="https://github.com/edge-ml/EdgeML-Arduino"
            target="_blank"
            rel="noreferrer"
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
      icon: IconFileUpload,
      title: "CSV File Upload",
      description: (
        <>
          Learn how to prepare your CSV file{" "}
          <a
            href="https://github.com/edge-ml/EdgeML-Arduino"
            target="_blank"
            rel="noreferrer"
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
      icon: IconCode,
      title: "Library Upload",
      description: "Implement custom logic using edge-ml libraries.",
      buttonText: "Generate Code",
      buttonAction: () => navigate("settings/getCode"),
    },
    {
      icon: IconDeviceMobile,
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
      className="p-4 pt-4 pb-5 mb-4"
      style={{
        background: "linear-gradient(135deg, rgb(20, 30, 48), rgb(36, 48, 68))",
      }}
    >
      <Text c="white" opacity={0.7} fw={700} mb="md">
        DATA UPLOAD
      </Text>

      {job && (
        <WharImportBadge
          job={job}
          status={status}
          elapsed={now - job.startedAt}
          onOpen={() => setWharModalOpen(true)}
          onDismiss={clear}
        />
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {dataUploadOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Group key={index} gap="sm" align="flex-start" wrap="nowrap">
              <ThemeIcon
                size="lg"
                variant="light"
                color="green"
                style={{
                  backgroundColor: "rgba(71, 187, 120, 0.15)",
                  color: "#47bb78",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} />
              </ThemeIcon>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={700} mb={4} c="white">
                  {option.title}
                </Text>
                <Text size="xs" c="gray.4">
                  {option.description}
                </Text>
                <Button
                  id={`buttonUpload${option.title.replace(/ /g, "")}`}
                  variant="outline"
                  color="green"
                  size="compact-sm"
                  mt="sm"
                  onClick={option.buttonAction}
                >
                  {option.buttonText}
                </Button>
              </div>
            </Group>
          );
        })}
      </SimpleGrid>

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
