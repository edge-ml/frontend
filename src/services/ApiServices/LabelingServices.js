var apiConsts = require('./ApiConstants');
const { default: LocalStorageService } = require('../LocalStorageService');
const ax = require('axios');
const axios = ax.create();
const localStorageService = LocalStorageService.getService();

axios.interceptors.request.use(config => {
  const token = localStorageService.getAccessToken();
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

module.exports.subscribeLabelingsAndLabels = (accessToken, callback) => {
  Promise.all([
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS
      )
    ),
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_TYPES
      )
    )
  ])
    .then(results => callback(results[0].data, results[1].data))
    .catch(err => window.alert(err));
};

module.exports.addLabeling = (accessToken, newLabeling, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
      newLabeling
    )
  )
    .then(
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS
        )
      )
        .then(lableings => {
          if (callback) {
            callback(lableings.data, undefined);
          }
        })
        .catch(err => window.alert(err))
    )
    .catch(err => window.alert(err));
};

module.exports.deleteLabeling = (accessToken, labelingId, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.DELETE,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS + `/${labelingId}`
    )
  ).then(() => {
    Promise.all([
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS
        )
      ),
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.LABEL_TYPES
        )
      )
    ])
      .then(results => {
        if (callback) {
          callback(results[0].data, results[1].data);
        }
      })
      .catch(err => window.alert(err));
  });
};

module.exports.updateLabeling = (accessToken, labeling, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.PUT,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS + `/${labeling['_id']}`,
      labeling
    )
  )
    .then(() =>
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS
        )
      )
    )
    .then(labelings => {
      callback(labelings.data, undefined);
    })
    .catch(err => window.alert(err));
};

module.exports.updateLabelingAndLabels = (
  accessToken,
  labeling,
  labels,
  deletedLabels,
  callback
) => {
  Promise.all(
    labels
      .filter(label => label.isNewLabel)
      .map(label =>
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.POST,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.LABEL_TYPES,
            label
          )
        )
      )
  )
    .then(newLabels => {
      let newLabelsId = newLabels.map(label => label.data['_id']);
      labeling.labels = [...labeling.labels, ...newLabelsId];
      let promises = [];
      if (!labeling['_id']) {
        promises = [
          ...promises,
          axios(
            apiConsts.generateApiRequest(
              apiConsts.HTTP_METHODS.POST,
              apiConsts.API_URI,
              apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
              labeling
            )
          )
        ];
      } else {
        let updatedLabels = labels.filter(label => label.updated);

        promises = [
          ...promises,
          axios(
            apiConsts.generateApiRequest(
              apiConsts.HTTP_METHODS.PUT,
              apiConsts.API_URI,
              apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS + `/${labeling['_id']}`,
              labeling
            )
          ),
          ...updatedLabels.map(label =>
            axios(
              apiConsts.generateApiRequest(
                apiConsts.HTTP_METHODS.PUT,
                apiConsts.API_URI,
                apiConsts.API_ENDPOINTS.LABEL_TYPES + `/${label['_id']}`,
                label
              )
            )
          ),
          ...deletedLabels.map(labelId =>
            axios(
              apiConsts.generateApiRequest(
                apiConsts.HTTP_METHODS.DELETE,
                apiConsts.API_URI,
                apiConsts.API_ENDPOINTS.LABEL_TYPES + `/${labelId}`
              )
            )
          )
        ];
      }

      return Promise.all(promises);
    })
    .then(() => {
      return Promise.all([
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
      ]);
    })
    .then(results => {
      callback(results[0].data, results[1].data);
    })
    .catch(err => window.alert(err));
};
