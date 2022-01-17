const { generateCSV } = require('./CsvService');

module.exports.downloadSingleDataset = (dataset, labelings, labels) => {
  const csv = generateCSV(dataset, labelings, labels);
  const fileName = dataset.name;
  const blob = new Blob([csv], { type: 'application/csv' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName + '.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
