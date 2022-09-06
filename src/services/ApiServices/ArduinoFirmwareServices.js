var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

module.exports.getArduinoFirmware = function (deviceName) {
  const request = apiConsts.generateApiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.API_URI,
    apiConsts.API_ENDPOINTS.ARDUINOFIRMWARE + `/${deviceName}`
  );
  request['responseType'] = 'arraybuffer';
  return new Promise((resolve, reject) => {
    axios(request)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => reject(err.response));
  });
};
