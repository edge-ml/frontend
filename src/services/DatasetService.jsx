import * as JSZip from "jszip";
import { generateCSV } from "./CsvService";
import { getDataset } from "../services/ApiServices/DatasetServices";
import {
  HTTP_METHODS,
  DATASET_STORE,
  DATASET_STORE_ENDPOINTS,
} from "./ApiServices/ApiConstants";
import apiRequest from "./ApiServices/request";
import { downloadBlob } from "./helpers";

const registerDatasetDownload = async (dataset) => {
  return apiRequest(
    HTTP_METHODS.POST,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.CSV + `dataset/${dataset._id}`
  );
};

const registerProjectDownload = async () => {
  return apiRequest(
    HTTP_METHODS.POST,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.CSV + "project"
  );
};

const datasetDownloadStatus = async () => {
  const res = await apiRequest(
    HTTP_METHODS.GET,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.CSV + "status/"
  );
  return res;
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
  try {
    return await apiRequest(
      HTTP_METHODS.DELETE,
      DATASET_STORE,
      DATASET_STORE_ENDPOINTS.CSV + `${downloadId}`
    );
  } catch {
    return 404;
  }
};

const datasetDownloadfromId = async (downloadId) => {
  const blob = await apiRequest(
    HTTP_METHODS.GET,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.CSV + downloadId,
    null,
    {},
    undefined,
    "blob"
  );
  return downloadBlob(blob, `edge-ml-download-${downloadId}.zip`);
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
      const dataset = await getDataset(elm._id);
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
  await downloadFile(zip_blob, "datasets.zip");
};

const downloadFile = (blob, fileName) => downloadBlob(blob, fileName);

export {
  registerDatasetDownload,
  datasetDownloadfromId,
  downloadAllAsZip,
  downloadFile,
  datasetDownloadStatus,
  registerProjectDownload,
  cancelDownload,
};
