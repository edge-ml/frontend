import * as JSZip from "jszip";
import { generateCSV } from "./CsvService";
import { getDataset } from "../services/ApiServices/DatasetServices";
import { HTTP_METHODS, DATASET_STORE } from "./ApiServices/ApiConstants";
import apiRequest from "./ApiServices/request";
import { getCurrentProjectId } from "./ApiServices/projectContext";

const registerDatasetDownload = async (datasetId) => {
  const projectId = getCurrentProjectId();
  if (!projectId || !datasetId) {
    return;
  }
  const res = await apiRequest(
    HTTP_METHODS.POST,
    DATASET_STORE,
    `${projectId}/download/dataset/${datasetId}`
  );
  return res;
};

const registerProjectDownload = async () => {
  const projectId = getCurrentProjectId();
  if (!projectId) {
    return;
  }
  const res = await apiRequest(
    HTTP_METHODS.POST,
    DATASET_STORE,
    `${projectId}/download/project`
  );
  return res;
};

const datasetDownloadStatus = async () => {
  const projectId = getCurrentProjectId();
  if (!projectId) {
    return [];
  }
  const res = await apiRequest(
    HTTP_METHODS.GET,
    DATASET_STORE,
    `${projectId}/download/status`
  );
  return res || [];
};

// const datasetDownloadStatus = async () => {
//   try {
//     const request_params = generateApiRequest(
//       HTTP_METHODS.GET,
//       DATASET_STORE,
//       DATASET_STORE_ENDPOINTS.CSV + 'status/',
//     );
//     const response = await axios(request_params);
//     return response.data;
//   } catch {
//     return 404;
//   }
// };

const cancelDownload = async (downloadId) => {
  const projectId = getCurrentProjectId();
  if (!projectId || !downloadId) {
    return;
  }
  const res = await apiRequest(
    HTTP_METHODS.DELETE,
    DATASET_STORE,
    `${projectId}/download/${downloadId}`
  );
  return res;
};

const datasetDownloadfromId = async (downloadId) => {
  const projectId = getCurrentProjectId();
  if (!projectId || !downloadId) {
    return;
  }
  window.open(`${DATASET_STORE}${projectId}/download/${downloadId}`);
};

const downloadDatasetCsv = async (datasetId) => {
  return registerDatasetDownload(datasetId);
};

const downloadAllAsZip = async (datasets, labelings, labels) => {
  const zip = new JSZip();

  var nameCtr = {};
  var names = [];
  datasets.forEach((elm) => {
    const ctr = nameCtr[elm.name] || 0;
    const nameExt = ctr === 0 ? "" : "_" + ctr;
    names.push(elm.name + nameExt);
    nameCtr[elm.name] = ctr + 1;
  });

  await Promise.all(
    datasets.map(async (elm, idx) => {
      const dataset = await getDataset(elm.id);
      const csv = generateCSV(dataset, labelings, labels);
      const json = JSON.stringify(dataset.metaData);
      const csv_fileName = names[idx] + ".csv";
      const json_fileName = names[idx] + "_metaData.json";
      const blob_dataset = new Blob([csv], { type: "application/csv" });
      const blob_metaData = new Blob([json], { type: "application/json" });
      zip.file(csv_fileName, blob_dataset);
      if (Object.keys(dataset.metaData).length !== 0) {
        zip.file(json_fileName, blob_metaData);
      }
    })
  );
  const zip_blob = await zip.generateAsync({ type: "blob" });
  downloadFile(zip_blob, "datasets.zip");
};

const downloadFile = (blob, fileName) => {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export {
  registerDatasetDownload,
  datasetDownloadfromId,
  downloadDatasetCsv,
  downloadAllAsZip,
  downloadFile,
  datasetDownloadStatus,
  registerProjectDownload,
  cancelDownload,
};
