import apiConsts from "./ApiConstants";
import apiRequest from "./request";

export const getArduinoFirmware = async (deviceName) =>
  apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.API_URI,
    apiConsts.API_ENDPOINTS.ARDUINOFIRMWARE + `/${deviceName}`,
    {},
    {},
    "application/json",
    "arraybuffer"
  );

export const getLatestEdgeMLVersionNumber = async () => {
  const tags = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    "https://api.github.com/repos/edge-ml/EdgeML-Arduino/",
    "tags"
  );
  const format = /^[0-9][0-9.]*$/;
  if (!tags[0] || !format.test(tags[0].name)) {
    throw new Error("Illegal version format");
  }
  return tags[0].name;
};
