import { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";
import { processCSVBackend } from "../../services/ApiServices/CSVServices";
import {
  createDataset,
  deleteDataset,
} from "../../services/ApiServices/DatasetServices";
import { uploadMedia } from "../../services/ApiServices/MediaServices";
import { describePlacement } from "../../routes/dataset/media/mediaUtils";
import { notifications } from "@mantine/notifications";
import { extractHeader, parseHeader } from "./csvParser";

const FileStatus = Object.freeze({
  CONFIGURATION: "Ready",
  UPLOADING: "Uploading",
  PROCESSING: "Processing",
  COMPLETE: "Complete",
  ERROR: "Error",
  CANCELLED: "Cancelled",
});

export { FileStatus };

const MEDIA_EXTENSIONS = {
  video: /\.(mp4|m4v|mov|webm)$/i,
  audio: /\.(mp3|wav|ogg|oga|opus|flac|m4a|aac)$/i,
};

// "csv" | "audio" | "video" | undefined
export const fileKind = (file) => {
  const name = file?.name ?? "";
  const type = file?.type ?? "";
  if (/\.csv$/i.test(name) || type === "text/csv") return "csv";
  if (type.startsWith("video/") || MEDIA_EXTENSIONS.video.test(name)) return "video";
  if (type.startsWith("audio/") || MEDIA_EXTENSIONS.audio.test(name)) return "audio";
  return undefined;
};

const baseName = (name) => name.replace(/\.[^.]+$/, "") || name;

// Where the files of the dialog go. With a `targetDataset` everything is added
// to it. Otherwise either all files make one dataset, or each file its own.
// One dataset is the default when the files are one CSV and recordings, or
// only recordings: recordings belong with the data they were made with.
export const defaultTogether = (files) => {
  const csvs = files.filter((f) => f.kind === "csv").length;
  const media = files.filter((f) => f.kind === "audio" || f.kind === "video").length;
  return media > 0 && csvs <= 1;
};

const errorText = (error) =>
  error?.response?.data?.detail || error?.message || "The upload failed";

export const useFileUploads = (onDatasetComplete, onCloseModal, targetDataset) => {
  const [files, setFiles] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  // undefined: follow defaultTogether; true/false: the user chose
  const [togetherChoice, setTogetherChoice] = useState(undefined);
  const [datasetName, setDatasetName] = useState(undefined);
  const [running, setRunning] = useState(false);
  const nextFileId = useRef(0);
  const filesRef = useRef(files);
  filesRef.current = files;

  const pending = files.filter((f) => f.status === FileStatus.CONFIGURATION);
  const together = targetDataset
    ? true
    : togetherChoice ?? defaultTogether(pending);
  // name of the one dataset: the CSV's, otherwise the first file's
  const suggestedName = useMemo(() => {
    const csv = pending.find((f) => f.kind === "csv" && f.config);
    if (csv) return csv.config.name;
    return pending[0] ? baseName(pending[0].name) : "";
  }, [pending]);

  const updateFile = useCallback((fileId, updates) => {
    setFiles((previousFiles) => {
      const nextFiles = previousFiles.map((file) =>
        file.id === fileId ? { ...file, ...updates } : file
      );
      filesRef.current = nextFiles;
      return nextFiles;
    });
  }, []);

  const onFileInput = useCallback(
    async (inputFiles) => {
      const added = Array.from(inputFiles, (file) => {
        const kind = fileKind(file);
        return {
          id: nextFileId.current++,
          name: file.name,
          kind,
          file,
          size: file.size,
          progress: 0,
          status: kind ? FileStatus.CONFIGURATION : FileStatus.ERROR,
          error: kind
            ? undefined
            : "Not a CSV, audio or video file (CSV, MP4, WebM, MP3, WAV, OGG, FLAC, M4A)",
        };
      });
      setFiles((previousFiles) => {
        const nextFiles = [...previousFiles, ...added];
        filesRef.current = nextFiles;
        return nextFiles;
      });

      for (const item of added.filter((f) => f.kind === "csv")) {
        try {
          const header = await extractHeader(item.file);
          const [timeSeries, labelings] = parseHeader(header);
          if (!timeSeries || !labelings) {
            updateFile(item.id, {
              error: "Invalid format, parsing failed",
              status: FileStatus.ERROR,
            });
            continue;
          }
          updateFile(item.id, {
            config: {
              timeSeries,
              labelings,
              name: baseName(item.name),
              editingModeActive: false,
            },
          });
        } catch (error) {
          updateFile(item.id, {
            error: error.message || "Failed to parse file",
            status: FileStatus.ERROR,
          });
        }
      }
    },
    [updateFile]
  );

  // -- single uploads ---------------------------------------------------------

  const progressOf = (fileId) => (fraction) =>
    updateFile(fileId, {
      progress: Math.min(100, fraction * 100),
      // all bytes sent: the server now reads the file
      ...(fraction >= 1 ? { status: FileStatus.PROCESSING } : {}),
    });

  // A CSV as a new dataset (no `datasetId`) or added to one. Resolves to the
  // id of the dataset.
  const sendCsv = async (item, datasetId, name) => {
    const formData = new FormData();
    formData.append("CSVFile", item.file);
    formData.append(
      "CSVConfig",
      JSON.stringify({
        ...item.config,
        ...(name ? { name } : {}),
        editingModeActive: false,
      })
    );
    updateFile(item.id, { status: FileStatus.UPLOADING, error: undefined });
    const [cancel, request] = processCSVBackend(
      formData,
      item.id,
      (_, percent) => progressOf(item.id)(percent / 100),
      datasetId
    );
    updateFile(item.id, { cancellationHandler: cancel });
    const { data } = await request;
    const skipped = data?.skippedLabels;
    updateFile(item.id, {
      status: FileStatus.COMPLETE,
      progress: 100,
      note: datasetId
        ? `Added ${data.added?.join(", ") || "no time-series"}` +
          (skipped ? `; ${skipped} label${skipped === 1 ? "" : "s"} left out, as they overlap existing ones` : "")
        : undefined,
    });
    return datasetId ?? data._id;
  };

  const sendMedia = async (item, datasetId) => {
    updateFile(item.id, { status: FileStatus.UPLOADING, error: undefined });
    const media = await uploadMedia(datasetId, item.file, {}, progressOf(item.id));
    updateFile(item.id, {
      status: FileStatus.COMPLETE,
      progress: 100,
      note: describePlacement(media),
    });
  };

  const fail = (item, error) => {
    const cancelled = axios.isCancel(error) || error?.code === "ERR_CANCELED";
    updateFile(item.id, {
      status: cancelled ? FileStatus.CANCELLED : FileStatus.ERROR,
      error: cancelled ? "Upload cancelled" : errorText(error),
    });
  };

  // Uploads `items` into `datasetId` one after the other.
  const sendAllTo = async (items, datasetId) => {
    for (const item of items) {
      try {
        if (item.kind === "csv") await sendCsv(item, datasetId);
        else await sendMedia(item, datasetId);
      } catch (error) {
        fail(item, error);
      }
    }
  };

  // -- the upload button ------------------------------------------------------

  const handleUploadAll = useCallback(async () => {
    const items = filesRef.current.filter(
      (f) =>
        f.status === FileStatus.CONFIGURATION && (f.kind !== "csv" || f.config)
    );
    if (items.length === 0) return;
    setRunning(true);
    try {
      if (targetDataset) {
        await sendAllTo(items, targetDataset._id);
      } else if (together) {
        const name = (datasetName ?? suggestedName).trim() || suggestedName;
        // the first CSV makes the dataset; without one an empty dataset does
        const first = items.find((f) => f.kind === "csv");
        let datasetId;
        try {
          datasetId = first
            ? await sendCsv(first, undefined, name)
            : (await createDataset({ name, timeSeries: [], labelings: [] }))._id;
        } catch (error) {
          if (first) fail(first, error);
          items
            .filter((f) => f !== first)
            .forEach((f) =>
              updateFile(f.id, {
                status: FileStatus.ERROR,
                error: `The dataset could not be created: ${errorText(error)}`,
              })
            );
          return;
        }
        await sendAllTo(items.filter((f) => f !== first), datasetId);
      } else {
        for (const item of items) {
          if (item.kind === "csv") {
            try {
              await sendCsv(item);
            } catch (error) {
              fail(item, error);
            }
            continue;
          }
          let dataset;
          try {
            dataset = await createDataset({
              name: baseName(item.name),
              timeSeries: [],
              labelings: [],
            });
            await sendMedia(item, dataset._id);
          } catch (error) {
            fail(item, error);
            // no empty dataset for a recording that was refused
            if (dataset) await deleteDataset(dataset._id).catch(() => {});
          }
        }
      }
    } finally {
      setRunning(false);
      await onDatasetComplete?.();
      const all = filesRef.current;
      if (all.length > 0 && all.every((f) => f.status === FileStatus.COMPLETE)) {
        // the dialog goes; what it would have said stays a moment longer
        const notes = all.filter((f) => f.note);
        if (notes.length > 0) {
          notifications.show({
            color: "teal",
            autoClose: 10000,
            title: all.length === 1 ? `Uploaded ${all[0].name}` : `Uploaded ${all.length} files`,
            message: notes.map((f) => `${f.name}: ${f.note}`).join("\n"),
            style: { whiteSpace: "pre-line" },
          });
        }
        closeNow();
      }
    }
  }, [targetDataset, together, datasetName, suggestedName, onDatasetComplete]);

  // -- list and closing -------------------------------------------------------

  const handleCancel = useCallback(
    (file) => {
      file.cancellationHandler?.();
      updateFile(file.id, {
        status: FileStatus.CANCELLED,
        error: "Upload cancelled",
      });
    },
    [updateFile]
  );

  const handleDelete = useCallback((fileId) => {
    setFiles((previousFiles) => {
      const nextFiles = previousFiles.filter((file) => file.id !== fileId);
      filesRef.current = nextFiles;
      return nextFiles;
    });
  }, []);

  const changeConfig = useCallback(
    (fileId, newConfig) => updateFile(fileId, { config: newConfig }),
    [updateFile]
  );

  const closeNow = () => {
    filesRef.current
      .filter((file) => file.status === FileStatus.UPLOADING)
      .forEach((file) => file.cancellationHandler?.());
    filesRef.current = [];
    setFiles([]);
    setShowWarning(false);
    setTogetherChoice(undefined);
    setDatasetName(undefined);
    onCloseModal();
  };

  const handleModalClose = useCallback(() => {
    const busy = filesRef.current.some(
      (file) =>
        file.status === FileStatus.UPLOADING ||
        file.status === FileStatus.PROCESSING
    );
    if (busy) {
      setShowWarning(true);
      return;
    }
    closeNow();
  }, []);

  return {
    files,
    showWarning,
    onFileInput,
    handleUploadAll,
    handleModalClose,
    handleDelete,
    handleCancel,
    handleConfirmClose: closeNow,
    handleCancelClose: () => setShowWarning(false),
    changeConfig,
    together,
    setTogether: setTogetherChoice,
    datasetName: datasetName ?? suggestedName,
    setDatasetName,
    running,
    canUpload: !running && pending.some((f) => f.kind !== "csv" || f.config),
    FileStatus,
  };
};
