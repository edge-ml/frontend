import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const processCSVBackend = (files) => {
  return axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.PROCESS_CSV,
      files,
      {},
      'multipart/form-data'
    )
  )
    .then((res) => res.data)
    .catch((err) => err.response);
};
