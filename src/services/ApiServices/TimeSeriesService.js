const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

const getTimeSeriesForDataset = (datasetId) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.TS_URI,
        apiConsts.TS_ENDPOINTS.TIMESERIESFORDATASET + datasetId
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => console.log(err));
  });
};

const getTimeSeriesByIdBatch = (ids) => {
  console.log(ids);
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.TS_URI,
        apiConsts.TS_ENDPOINTS.BATCH,
        ids
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => console.log(err));
  });
};

module.exports.getTimeSeriesForDataset = getTimeSeriesForDataset;
module.exports.getTimeSeriesByIdBatch = getTimeSeriesByIdBatch;
