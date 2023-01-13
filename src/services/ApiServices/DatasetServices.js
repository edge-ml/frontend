const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

module.exports.getDatasets = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS_PROJECT
      )
    )
      .then((result) => resolve(result.data))
      .catch((err) => {
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
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASET + `${id}`
      )
    )
      .then((dataset) => resolve(dataset.data))
      .catch((err) => reject(err.response));
  });
};

module.exports.getDatasetLock = (id) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS_CAN_EDIT + `/${id}`
      )
    )
      .then((lock) => {
        resolve(lock.data ? lock.data.canEdit : undefined);
      })
      .catch((err) => reject(err.response));
  });
};

module.exports.deleteDatasets = (ids) => {
  try {
    const promises = ids.map((elm) => this.deleteDataset(elm));
    return Promise.all(promises);
  } catch (e) {
    console.log(e);
  }
};

module.exports.deleteDataset = (id) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASET + `${id}`
      )
    )
      .then(resolve())
      .catch((err) => reject(err.response));
  });
};

module.exports.updateDataset = (dataset, onlyMetaData) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS + `/${dataset['_id']}`,
        dataset
      )
    )
      .then(() =>
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.GET,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.DATASETS + `/${dataset['_id']}`,
            {},
            { onlyMetaData: onlyMetaData }
          )
        ).then((updatedDataset) => {
          resolve(updatedDataset.data);
        })
      )
      .catch((err) => reject(err.response));
  });
};

module.exports.changeCanEditDataset = (dataset, lock) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS_CAN_EDIT + `/${dataset['_id']}`,
        { canEdit: lock }
      )
    )
      .then(() =>
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.GET,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.DATASETS_CAN_EDIT + `/${dataset['_id']}`
          )
        ).then((updatedLock) => {
          resolve(updatedLock.data ? updatedLock.data.canEdit : undefined);
        })
      )
      .catch((err) => reject(err.response));
  });
};

module.exports.createDataset = (dataset) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS,
        dataset
      )
    )
      .then(() => {
        this.getDatasets().then((datasets) => {
          resolve(datasets);
        });
      })
      .catch((err) => reject(err.response));
  });
};

module.exports.createDatasets = (datasets) => {
  return new Promise((resolve, reject) => {
    const promises = datasets.map((dataset) =>
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.POST,
          apiConsts.DATASET_STORE,
          apiConsts.DATASET_STORE_ENDPOINTS.DATASET,
          dataset
        )
      )
    );
    Promise.all(promises)
      .then(() => {
        this.getDatasets().then((datasets) => {
          resolve(datasets);
        });
      })
      .catch((err) => reject(err.response));
  });
};

module.exports.appendToDataset = (dataset, data) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.DATASETS +
        `/${dataset['_id']}` +
        '/timeseries/append',
      data
    )
  )
    .then((result) => result.data)
    .catch((err) => err.response);
};
