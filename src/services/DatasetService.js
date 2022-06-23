import * as JSZip from 'jszip';
import { ga_downloadDataset } from './AnalyticsService';
import { generateCSV } from './CsvService';
import { getDataset } from '../services/ApiServices/DatasetServices';

const downloadSingleDataset = (dataset, labelings, labels) => {
  // Download dataset
  const csv = generateCSV(dataset, labelings, labels);
  const fileName_dataset = dataset.name + '.csv';
  const blob_dataset = new Blob([csv], { type: 'application/csv' });
  downloadFile(blob_dataset, fileName_dataset);

  // Download metadata
  if (Object.keys(dataset.metaData).length !== 0) {
    const json = JSON.stringify(dataset.metaData);
    const fileName_metaData = dataset.name + '_metaData.json';
    const blob_metaData = new Blob([json], { type: 'application/json' });
    downloadFile(blob_metaData, fileName_metaData);
  }
  ga_downloadDataset(dataset);
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

export { downloadSingleDataset, downloadAllAsZip, downloadFile };
