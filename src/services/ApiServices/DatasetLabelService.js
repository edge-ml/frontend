import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();
const axiosNoToken = ax.create();

export const createDatasetLabel = (datasetId, labelingId, label) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS +
          `/${datasetId}/labels/${labelingId}/`,
        label
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err));
  });
};

export const changeDatasetLabel = (datasetId, labelingId, changedLabel) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.PUT,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.DATASETS + `/${datasetId}/labels/${labelingId}`,
      changedLabel
    )
  );
};

export const deleteDatasetLabel = (datasetId, labelingId, labelId) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.DELETE,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.DATASETS +
        `/${datasetId}/labels/${labelingId}/${labelId}`
    )
  );
};
