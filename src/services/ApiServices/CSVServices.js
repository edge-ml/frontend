import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const processCSVBackend = (formData, fileId, handleProgress) => {
  const source = ax.CancelToken.source();

  const cancellationHandler = () => {
    source.cancel('Operation cancelled by the user');
  };

  const req = axios({
    ...apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.DATASET_STORE,
      apiConsts.DATASET_STORE_ENDPOINTS.CREATE_DATASET,
      formData,
      {},
      'multipart/form-data'
    ),
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded / progressEvent.total) * 100;
      handleProgress(fileId, progress);
    },
    cancelToken: source.token,
  });

  return [cancellationHandler, req];
};
