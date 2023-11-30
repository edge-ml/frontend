import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const getDatasets = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS
      )
    )
      .then((result) => {
        console.log(result);
        resolve(result.data);
      })
      .catch((err) => {
        console.log(err.response);
        reject(err.response);
      });
  });
};

export const getDatasetsWithPagination = (
  currentPage,
  pageSize,
  sort,
  selectedFilter,
  selectedFilterParams
) => {
  const queryParams = {
    page: currentPage,
    page_size: pageSize,
    sort: sort,
  };
  const requestBody = {
    filters: {},
  };

  if (selectedFilter) {
    requestBody.filters[selectedFilter] = selectedFilterParams;
  }
  const request = apiConsts.generateApiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS_VIEW,
    requestBody
  );
  request.params = queryParams;
  return new Promise((resolve, reject) => {
    axios(request)
      .then((result) => {
        console.log(result);
        resolve(result.data);
      })
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
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
          `${id}/ts/${start}/${end}/${max_resolution}`
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.response));
  });
};

export const getTimeSeriesDataPartial = (id, ts_ids, info) => {
  console.log(info);
  console.log(ts_ids);
  const { max_resolution, start, end } = info;
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
          `${id}/ts/${start}/${end}/${max_resolution}`,
        ts_ids
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
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${id}`
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
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${id}`
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
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${id}`
      )
    )
      .then(resolve())
      .catch((err) => reject(err.response));
  });
};

export const updateDataset = (dataset) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${dataset['_id']}`,
        dataset
      )
    )
      .then((updatedDataset) => {
        resolve(updatedDataset.data);
      })
      .catch((err) => reject(err.response));
  });
};

export const createDataset = (dataset) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.DATASETS,
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
          apiConsts.DATASET_STORE_ENDPOINTS.DATASETS,
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
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
        `${dataset['_id']}` +
        '/append',
      data
    )
  )
    .then((result) => result.data)
    .catch((err) => err.response);
};

export const getUploadProcessingProgress = (datasetId) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.GET_PROCESSING_PROGRESS +
        `?datasetId=${datasetId}`
    )
  )
    .then((result) => result.data.progress)
    .catch((err) => err.response);
};

export const changeDatasetName = (datasetId, newName) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.PUT,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
        datasetId +
        `/rename?newName=${newName}`
    )
  )
    .then((result) => result.data.message)
    .catch((err) => err.response);
};

export const updateTimeSeriesConfig = (
  datasetId,
  tsId,
  unit,
  scaling,
  offset
) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.PUT,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
        datasetId +
        `/changeUnitConfig?tsId=${tsId}&unit=${unit}&scaling=${scaling}&offset=${offset}`
    )
  )
    .then((result) => result.data.message)
    .catch((err) => err.response);
};
