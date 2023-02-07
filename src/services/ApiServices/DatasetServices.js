import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const getDatasets = () => {
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

export const getDatasetTimeseries = (id, info) => {
  console.log(info);
  const { max_resolution, start, end } = info;
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASET +
          `${id}/ts/${start}/${end}/${max_resolution}`
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getDataset = (id) => {
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

export const getDatasetMeta = (id) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASET + `${id}/meta`
      )
    )
      .then((dataset) => {
        console.log(dataset);
        resolve(dataset.data);
      })
      .catch((err) => {
        console.log(err);
        reject(err.response);
      });
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
  try {
    const promises = ids.map((elm) => deleteDataset(elm));
    return Promise.all(promises);
  } catch (e) {
    console.log(e);
    return e;
  }
};

export const deleteDataset = (id) => {
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
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASET,
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
          apiConsts.DATASET_STORE,
          apiConsts.DATASET_STORE_ENDPOINTS.DATASET,
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
      .catch((err) => {
        console.log(err);
        reject(err.response);
      });
  });
};

export const appendToDataset = (dataset, data) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.DATASET +
        `${dataset['_id']}` +
        '/append',
      data
    )
  )
    .then((result) => result.data)
    .catch((err) => err.response);
};
