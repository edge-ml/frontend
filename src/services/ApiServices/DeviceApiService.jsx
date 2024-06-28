import apiConsts from './ApiConstants';
import ax from 'axios';
import apiRequest from './request';


export const setDeviceApiKey = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.API_URI,
    apiConsts.API_ENDPOINTS.SETDEVICEAPIKEY,
  );
  return res;
}

export const getDeviceApiKey = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.API_URI,
    apiConsts.API_ENDPOINTS.GETDEVICEAPIKEY,
  );
  return res;
}

export const deleteDeviceApiKey = async () => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.API_URI,
    apiConsts.API_ENDPOINTS.REMOVEDEVICEAPIKEY,
  );
  return res;
}


export const switchDeviceApiActive = async (activeState) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.API_URI,
    apiConsts.API_ENDPOINTS.SWTICHDEVICEAPIACTIVE,
    { state: activeState },
  );
  return res;
}
