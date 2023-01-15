import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

// TODO: change fileName to fileId to make it unique
export const processCSVBackend = (formData, fileName, handleProgress) => {
  return axios({
    ...apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.PROCESS_CSV,
      formData,
      {},
      'multipart/form-data'
    ),
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 100;
      console.log('pro', fileName, progress);
      handleProgress(fileName, progress);
    },
  })
    .then((res) => res.data)
    .catch((err) => err.response);
};
