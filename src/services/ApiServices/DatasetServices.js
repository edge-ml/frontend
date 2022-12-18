import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const getDatasets = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS
      )
    )
      .then((result) => resolve(result.data))
      .catch((err) => {
        console.log(err.response);
        reject(err.response);
      });
  });
};

export const getDataset = (id, callback) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS + `/${id}`
      )
    )
      .then((dataset) => resolve(dataset.data))
      .catch((err) => reject(err.response));
  });
};

export const getDatasetLock = (id) => {
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

export const deleteDatasets = (ids) => {
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
        ),
      ];
    }
    return Promise.all(promises)
      .then(resolve())
      .catch((err) => reject(err.response));
  });
};

export const deleteDataset = (id) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS + `/${id}`
      )
    )
      .then(resolve())
      .catch((err) => reject(err.response));
  });
};

export const updateDataset = (dataset, onlyMetaData) => {
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

export const changeCanEditDataset = (dataset, lock) => {
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

export const createDataset = (dataset) => {
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
        getDatasets().then((datasets) => {
          resolve(datasets);
        });
      })
      .catch((err) => reject(err.response));
  });
};

export const createDatasets = (datasets) => {
  return new Promise((resolve, reject) => {
    const promises = datasets.map((dataset) =>
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
        getDatasets().then((datasets) => {
          resolve(datasets);
        });
      })
      .catch((err) => reject(err.response));
  });
};

export const appendToDataset = (dataset, data) => {
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

export const processCSVBackend = (files) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROCESS_CSV,
        files,
        {},
        'multipart/form-data'
      )
    )
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => reject(err.response));
  });
};

export const generateDatasetBackend = (timeData) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.GENERATE_DATASET,
      timeData
    )
  )
    .then((result) => result)
    .catch((err) => err.response);
};
