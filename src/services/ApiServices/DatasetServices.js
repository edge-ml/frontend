var apiConsts = require('./ApiConstants');
const axios = require('axios');

module.exports.getDatasets = accessToken => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.DATASETS,
      accessToken
    )
  );
};

module.exports.deleteDatasets = (accessToken, ids, callback) => {
  let promises = [];
  for (let id of ids) {
    promises = [
      ...promises,
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.DELETE,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.DATASETS + `/${id}`
        )
      )
    ];
  }
  return Promise.all(promises)
    .then(callback(false))
    .catch(callback(true));
};
