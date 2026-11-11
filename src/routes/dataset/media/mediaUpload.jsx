import { notifications } from "@mantine/notifications";
import { uploadMedia } from "../../../services/ApiServices/MediaServices";
import {
  createDataset,
  deleteDataset,
} from "../../../services/ApiServices/DatasetServices";

// Uploads one recording into a dataset and reports the progress in a
// notification. Resolves to true when it was added.
export const uploadMediaWithNotification = async (datasetId, file, doneMessage) => {
  const id = `media-upload-${file.name}-${Date.now()}`;
  const progress = (message) => ({
    id,
    loading: true,
    autoClose: false,
    withCloseButton: false,
    title: `Uploading ${file.name}`,
    message,
  });
  notifications.show(progress("Starting…"));
  try {
    await uploadMedia(datasetId, file, {}, (fraction) =>
      notifications.update(
        progress(
          fraction < 1 ? `${Math.round(fraction * 100)} %` : "Checking the file…"
        )
      )
    );
    notifications.update({
      id,
      loading: false,
      autoClose: 4000,
      withCloseButton: true,
      color: "teal",
      title: `Added ${file.name}`,
      message: doneMessage,
    });
    return true;
  } catch (error) {
    notifications.update({
      id,
      loading: false,
      autoClose: false,
      withCloseButton: true,
      color: "red",
      title: `Could not add ${file.name}`,
      message: error.message || "The upload failed",
    });
    return false;
  }
};

// Creates one dataset per file, holding just that recording. Sensor data can
// be appended and further recordings added to it later.
export const createDatasetsFromMedia = async (files) => {
  let created = 0;
  for (const file of files) {
    const name = file.name.replace(/\.[^.]+$/, "") || file.name;
    let dataset;
    try {
      dataset = await createDataset({ name, timeSeries: [], labelings: [] });
    } catch (error) {
      notifications.show({
        color: "red",
        title: `Could not create a dataset for ${file.name}`,
        message: error.message || "The request failed",
      });
      continue;
    }
    const added = await uploadMediaWithNotification(
      dataset._id,
      file,
      `Created the dataset "${name}".`
    );
    if (added) created += 1;
    // do not leave an empty dataset behind for a file that was refused
    else await deleteDataset(dataset._id).catch(() => {});
  }
  return created;
};
