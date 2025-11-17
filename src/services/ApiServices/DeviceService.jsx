import apiConsts from "./ApiConstants";
import ax from "axios";
import apiRequest from "./request";

export const getDeviceByNameAndGeneration = async (name, generation) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.API_URI,
    apiConsts.API_ENDPOINTS.DEVICE + `/${name}` + `/${generation}`
  );
  return res;
};
