var apiConsts = require('./ApiConstants');
const axios = require('axios');

module.exports.subscribeLabelingsAndLabels = (accessToken, callback) => {
  Promise.all([
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
        accessToken
      )
    ),
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_TYPES,
        accessToken
      )
    )
  ])
    .then(results => callback(results[0].data, results[1].data))
    .catch(err => console.log(err));
};

module.exports.addLabeling = (accessToken, newLabeling, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
      accessToken,
      newLabeling
    )
  ).then(
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
        accessToken
      )
    ).then(lableings => {
      if (callback) {
        callback(lableings.data, undefined);
      }
    })
  );
};

module.exports.deleteLabeling = (accessToken, labelingId, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.DELETE,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS + `/${labelingId}`,
      accessToken
    )
  ).then(() => {
    Promise.all([
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
          accessToken
        )
      ),
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.LABEL_TYPES,
          accessToken
        )
      )
    ]).then(results => {
      if (callback) {
        callback(results[0].data, results[1].data);
      }
    });
  });
};
