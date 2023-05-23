import * as JSZip from 'jszip';
import { ga_downloadDataset } from './AnalyticsService';
import { generateCSV } from './CsvService';
import { getDataset } from '../services/ApiServices/DatasetServices';
import {
  generateApiRequest,
  HTTP_METHODS,
  DATASET_STORE,
  DATASET_STORE_ENDPOINTS,
} from './ApiServices/ApiConstants';
import ax from 'axios';

const axios = ax.create();

const registerDatasetDownload = async (dataset) => {
  console.log(dataset);
  const request_params = generateApiRequest(
    HTTP_METHODS.POST,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.CSV + `dataset/${dataset._id}`
  );
  const response = await axios(request_params);
  return response.data;
};

const registerProjectDownload = async () => {
  const request_params = generateApiRequest(
    HTTP_METHODS.POST,
    DATASET_STORE,
    DATASET_STORE_ENDPOINTS.CSV + 'project'
  );
  const response = await axios(request_params);
  return response.data;
};

const datasetDownloadStatus = async () => {
  try {
    const request_params = generateApiRequest(
      HTTP_METHODS.GET,
      DATASET_STORE,
      DATASET_STORE_ENDPOINTS.CSV + 'status/'
    );
    const response = await axios(request_params);
    return response.data;
  } catch {
    return 404;
  }
};

const cancelDownload = async (downloadId) => {
  try {
    const request_params = generateApiRequest(
      HTTP_METHODS.DELETE,
      DATASET_STORE,
      DATASET_STORE_ENDPOINTS.CSV + `${downloadId}`
    );
    const response = await axios(request_params);
    return response.data;
  } catch {
    return 404;
  }
};

const datasetDownloadfromId = async (downloadId) => {
  window.open(`${DATASET_STORE}${DATASET_STORE_ENDPOINTS.CSV}${downloadId}`);
};

const downloadAllAsZip = async (datasets, labelings, labels) => {
  const zip = new JSZip();

  var nameCtr = {};
  var names = [];
  datasets.forEach((elm) => {
    const ctr = nameCtr[elm.name] || 0;
    const nameExt = ctr === 0 ? '' : '_' + ctr;
    names.push(elm.name + nameExt);
    nameCtr[elm.name] = ctr + 1;
  });

  await Promise.all(
    datasets.map(async (elm, idx) => {
      const dataset = await getDataset(elm._id);
      const csv = generateCSV(dataset, labelings, labels);
      const json = JSON.stringify(dataset.metaData);
      const csv_fileName = names[idx] + '.csv';
      const json_fileName = names[idx] + '_metaData.json';
      const blob_dataset = new Blob([csv], { type: 'application/csv' });
      const blob_metaData = new Blob([json], { type: 'application/json' });
      zip.file(csv_fileName, blob_dataset);
      if (Object.keys(dataset.metaData).length !== 0) {
        zip.file(json_fileName, blob_metaData);
      }
    })
  );
  const zip_blob = await zip.generateAsync({ type: 'blob' });
  downloadFile(zip_blob, 'datasets.zip');
};

const downloadFile = (blob, fileName) => {
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export {
  registerDatasetDownload,
  datasetDownloadfromId,
  downloadAllAsZip,
  downloadFile,
  datasetDownloadStatus,
  registerProjectDownload,
  cancelDownload,
};
