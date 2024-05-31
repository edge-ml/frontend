import useApiCalls from './useApiCalls';
// const apiConsts = require('./ApiConstants');

// const ax = require('axios');
// const axios = ax.create();

// const getTimeSeriesForDataset = (datasetId) => {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.GET,
//         apiConsts.TS_URI,
//         apiConsts.TS_ENDPOINTS.TIMESERIESFORDATASET + datasetId
//       )
//     )
//       .then((data) => resolve(data.data))
//       .catch((err) => console.log(err));
//   });
// };

// const getTimeSeriesByIdBatch = (ids) => {
//   console.log(ids);
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.POST,
//         apiConsts.TS_URI,
//         apiConsts.TS_ENDPOINTS.BATCH,
//         ids
//       )
//     )
//       .then((data) => resolve(data.data))
//       .catch((err) => console.log(err));
//   });
// };

// module.exports.getTimeSeriesForDataset = getTimeSeriesForDataset;
// module.exports.getTimeSeriesByIdBatch = getTimeSeriesByIdBatch;

const useTimeSeriesApi = (project) => {
  const api = useApiCalls(project);

  const getTimeSeriesPartial = async (
    id,
    ts_id,
    start,
    end,
    max_resolution,
  ) => {
    const res = await api.request(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
        `${id}/ts/${ts_id}/${start}/${end}/${max_resolution}`,
    );
    return res;
  };

  return {
    getTimeSeriesPartial: getTimeSeriesPartial,
  };
};

export default useTimeSeriesApi;
