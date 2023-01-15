import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

// TODO: change fileName to fileId to make it unique
export const processCSVBackend = (formData, fileName, handleProgress) => {
  const source = ax.CancelToken.source();

  const cancellationHandler = () => {
    source.cancel('Operation cancelled by the user.');
  };

  const req = axios({
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
      handleProgress(fileName, progress);
    },
    cancelToken: source.token,
  });

  return [cancellationHandler, req];
};
