//import { getAccessToken} from '../LocalStorageService';
const getAccessToken = require('../LocalStorageService').getAccessToken;
const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

axios.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

module.exports.getDatasets = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS
      )
    )
      .then(result => resolve(result.data))
      .catch(err => {
        console.log(err.response);
        reject(err.response);
      });
  });
};

module.exports.getDataset = (id, callback) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS + `/${id}`
      )
    )
      .then(dataset => resolve(dataset.data))
      .catch(err => reject(err.response));
  });
};

module.exports.deleteDatasets = ids => {
  return new Promise((resolve, reject) => {
    console.log(ids);
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
      .then(resolve())
      .catch(err => reject(err.response));
  });
};

module.exports.deleteDataset = id => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS + `/${id}`
      )
    )
      .then(resolve())
      .catch(err => reject(err.response));
  });
};

module.exports.updateDataset = dataset => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS + `/${dataset['_id']}`,
        dataset
      )
    )
      .then(
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.GET,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.DATASETS + `/${dataset['_id']}`
          )
        ).then(updatedDataset => {
          resolve(updatedDataset.data);
        })
      )
      .catch(err => reject(err.response));
  });
};

module.exports.createDataset = dataset => {
  console.log(dataset);
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS,
        dataset
      )
    )
      .then(
        this.getDatasets().then(datasets => {
          resolve(datasets);
        })
      )
      .catch(err => reject(err.response));
  });
};
