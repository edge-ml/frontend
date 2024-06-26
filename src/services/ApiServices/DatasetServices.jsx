import apiConsts from "./ApiConstants";
import ax from "axios";
import useApiCalls from "./useApiCalls";
import useProjectStore from "../../stores/projectStore";
import apiRequest from "./request";

const axios = ax.create();

export const getDatasets = async (project) => {
  const res = apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS
  );
  return res;
};

export const getDatasetsPagination = async (skip, limit, sort) => {
  const res = apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + "view",
    {},
    { skip: skip, limit: limit, sort: sort }
  );
  return res;
};

export const updateDataset = async (dataset) => {
  
  const res = apiRequest(
    apiConsts.HTTP_METHODS.PUT,
    apiConsts.DATASET_STORE,
    apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${dataset["_id"]}`,
    dataset
  );
  return res;
};

const useDatasetAPI = () => {
  const { currentProject } = useProjectStore();
  const api = useApiCalls(currentProject);

  const getDataset = async (id) => {
    const res = await api.request(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${id}`
    );
    return res;
  };

  const getDatasets = async () => {
    const res = await api.request(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS
    );
    return res;
  };

  const deleteDataset = async (dataset_id) => {
    const res = await api.request(
      apiConsts.HTTP_METHODS.DELETE,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${dataset_id}`
    );
    return res;
  };

  const deleteDatasets = async (dataset_ids) => {
    const promises = dataset_ids.map((elm) => deleteDataset(elm));
    const res = await Promise.all(promises);
    return res;
  };

  const getDatasetsWithPagination = async (
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
      requestBody.filters[selectedFilter.value] = selectedFilterParams
        ? selectedFilterParams
        : [];
    }

    const res = api.request(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS_VIEW,
      requestBody,
      queryParams
    );
    return res;
  };

  // const updateDataset = async (dataset) => {
  //   const res = await api.request(
  //     apiConsts.HTTP_METHODS.PUT,
  //     apiConsts.DATASET_STORE,
  //     apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${dataset["_id"]}`,
  //     dataset
  //   );
  //   return res;
  // };

  return {
    getDataset: getDataset,
    getDatasets: getDatasets,
    deleteDataset: deleteDataset,
    deleteDatasets: deleteDatasets,
    updateDataset: updateDataset,
    getDatasetsWithPagination: getDatasetsWithPagination,
  };
};

export default useDatasetAPI;

// export const getDatasets = () => {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.GET,
//         apiConsts.DATASET_STORE,
//         apiConsts.DATASET_STORE_ENDPOINTS.DATASETS
//       )
//     )
//       .then((result) => {
//         
//         resolve(result.data);
//       })
//       .catch((err) => {
//         
//         reject(err.response);
//       });
//   });
// };

// export const getDatasetsWithPagination = (
//   currentPage,
//   pageSize,
//   sort,
//   selectedFilter,
//   selectedFilterParams
// ) => {
//   const queryParams = {
//     page: currentPage,
//     page_size: pageSize,
//     sort: sort,
//   };
//   const requestBody = {
//     filters: {},
//   };

//   if (selectedFilter) {
//     requestBody.filters[selectedFilter.value] = selectedFilterParams
//       ? selectedFilterParams
//       : [];
//   }
//   const request = apiConsts.generateApiRequest(
//     apiConsts.HTTP_METHODS.POST,
//     apiConsts.DATASET_STORE,
//     apiConsts.DATASET_STORE_ENDPOINTS.DATASETS_VIEW,
//     requestBody
//   );
//   request.params = queryParams;
//   return new Promise((resolve, reject) => {
//     axios(request)
//       .then((result) => {
//         
//         resolve(result.data);
//       })
//       .catch((err) => {
//         
//         reject(err.response);
//       });
//   });
// };

export const getDatasetTimeseries = (id, info) => {
  
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
        
        resolve(dataset.data);
      })
      .catch((err) => {
        
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

// export const updateDataset = (dataset) => {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.PUT,
//         apiConsts.DATASET_STORE,
//         apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + `${dataset["_id"]}`,
//         dataset
//       )
//     )
//       .then((updatedDataset) => {
//         resolve(updatedDataset.data);
//       })
//       .catch((err) => reject(err.response));
//   });
// };

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
        `${dataset["_id"]}` +
        "/append",
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
