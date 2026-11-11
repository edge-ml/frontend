// Audio and video recordings of a dataset.
import apiConsts from "./ApiConstants";
import apiRequest from "./request";

const { HTTP_METHODS, DATASET_STORE, DATASET_STORE_ENDPOINTS } = apiConsts;

const mediaEndpoint = (datasetId, mediaId) =>
  DATASET_STORE_ENDPOINTS.DATASETS +
  `${datasetId}/media` +
  (mediaId ? `/${mediaId}` : "");

// Adds a recording to a dataset. Without `start` (unix ms) the server places
// it at the beginning of the dataset. Resolves to the new mediaSeries entry.
export const uploadMedia = (datasetId, file, { name, start } = {}, onProgress) => {
  const form = new FormData();
  form.append("file", file, file.name);
  if (name) form.append("name", name);
  if (Number.isFinite(start)) form.append("start", String(Math.round(start)));
  // no Content-Type: the browser has to add the multipart boundary itself
  return apiRequest(
    HTTP_METHODS.POST,
    DATASET_STORE,
    mediaEndpoint(datasetId),
    form,
    {},
    null,
    "json",
    { onUploadProgress: onProgress }
  );
};

// changes: { name } and/or { start } (unix ms, moves it on the timeline)
export const updateMedia = (datasetId, mediaId, changes) =>
  apiRequest(
    HTTP_METHODS.PUT,
    DATASET_STORE,
    mediaEndpoint(datasetId, mediaId),
    changes
  );

export const deleteMedia = (datasetId, mediaId) =>
  apiRequest(
    HTTP_METHODS.DELETE,
    DATASET_STORE,
    mediaEndpoint(datasetId, mediaId)
  );

// Waveform of the sound: { rate, min[], max[] }
export const getMediaPeaks = (datasetId, mediaId) =>
  apiRequest(
    HTTP_METHODS.GET,
    DATASET_STORE,
    mediaEndpoint(datasetId, mediaId) + "/peaks"
  );

// A URL an <audio>/<video> element can play. Those cannot send the login or
// the project header, so the server hands out a link that carries its own
// short-lived token.
export const getMediaUrl = async (datasetId, mediaId) => {
  const { path } = await apiRequest(
    HTTP_METHODS.GET,
    DATASET_STORE,
    mediaEndpoint(datasetId, mediaId) + "/link"
  );
  // `path` starts with /ds/, which DATASET_STORE already ends with
  const root = new URL(DATASET_STORE, window.location.origin).href.replace(
    /\/ds\/?$/,
    ""
  );
  return root + path;
};
