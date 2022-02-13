module.exports.ga_downloadDataset = (dataset) => {
  try {
    const len_dataset = dataset.timeSeries.map((elm) => elm.data.length);
    const gtmData = { event: 'download_dataset', len_dataset: len_dataset };
    window.dataLayer.push(gtmData);
  } catch (err) {
    console.log(err);
  }
};

module.exports.ga_uploadDataset = (dataset, method) => {
  try {
    const len_dataset = dataset.timeSeries.map((elm) => elm.data.length);
    const gtmData = {
      event: 'upload_dataset',
      len_dataset: len_dataset,
      upload_method: method,
    };
    window.dataLayer.push(gtmData);
  } catch (err) {
    console.log(err);
  }
};

module.exports.ga_uploadataset_len = (len_dataset, method, device) => {
  try {
    const gtmData = {
      event: 'upload_dataset',
      len_dataset: len_dataset,
      upload_method: method,
      bluetooth_device: device,
    };
    console.log(gtmData);
    window.dataLayer.push(gtmData);
  } catch (err) {
    console.log(err);
  }
};

module.exports.ga_connectBluetooth = (device, error) => {
  try {
    const gtmData = {
      success: !!error,
      event: 'connect_bluetooth',
      bluetooth_device: device,
      'gtm.errorMessage': String(error),
    };
    window.dataLayer.push(gtmData);
  } catch (err) {
    console.log(err);
  }
};

module.exports.ga_copyCode = (language) => {
  try {
    const gtmData = { event: 'copy_code', language_code: language };
    window.dataLayer.push(gtmData);
  } catch (err) {
    console.log(err);
  }
};
