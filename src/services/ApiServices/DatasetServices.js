const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

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
        this.getDatasets().then(datasets => {
          resolve(datasets);
        });
      })
      .catch(err => reject(err.response));
  });
};

module.exports.createDatasets = datasets => {
  return new Promise((resolve, reject) => {
    const promises = datasets.map(dataset =>
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.POST,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.DATASETS,
          dataset
        )
      )
    );
    Promise.all(promises)
      .then(() => {
        this.getDatasets().then(datasets => {
          resolve(datasets);
        });
      })
      .catch(err => reject(err.response));
  });
};

module.exports.createApiKey = dataset => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETAPI + `/${dataset['_id']}`
      )
    )
      .then(() => {
        this.getDataset(dataset._id).then(newDataset => resolve(newDataset));
      })
      .catch(err => reject(err.response));
  });
};
