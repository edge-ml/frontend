import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();
const axiosNoToken = ax.create();

export const createDatasetLabel = (datasetId, labelingId, label) => {
  console.log(label);
  console.log(labelingId);
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.LABEL + `${datasetId}/${labelingId}/`,
        label
      )
    )
      .then((data) => resolve(data.data))
      .catch((err) => reject(err));
  });
};

export const changeDatasetLabel = (datasetId, labelingId, changedLabel) => {
  console.log(changedLabel);
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.PUT,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.LABEL +
        `${datasetId}/${labelingId}/${changedLabel._id}`,
      changedLabel
    )
  );
};

export const deleteDatasetLabel = (datasetId, labelingId, labelId) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.DELETE,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.LABEL +
        `${datasetId}/${labelingId}/${labelId}`
    )
  );
};
