var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

module.exports.compileFirmware = (data, compile_endpoint) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.COMPILE_URI,
        compile_endpoint,
        (body = data)
      )
    )
      .then((result) => resolve(result.data))
      .catch((err) => {
        console.log(err.response);
        reject(err.response);
      });
  });
};
