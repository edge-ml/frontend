import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const getPlatformCode = function (modelId, format) {
  return new Promise((resolve, reject) => {
    axios({
      ...apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + modelId + '/export/' + format
      ),
    })
      .then((resp) => resolve(resp.data))
      .catch((err) => reject(err.response));
  });
};

export const downloadDeploymentModel = function (modelId, format) {
  return new Promise((resolve, reject) => {
    axios({
      ...apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.ML_URI,
        apiConsts.ML_ENDPOINTS.DEPLOY + '/' + modelId + '/download/' + format
      ),
      responseType: 'blob',
    })
      .then((resp) => resolve(resp.data))
      .catch((err) => reject(err.response));
  });
};
