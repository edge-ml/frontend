const getAccessToken = require('../LocalStorageService').getAccessToken;
var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

axios.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

module.exports.subscribeLabelingsAndLabels = () => {
  return new Promise((resolve, reject) => {
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
      .then(results =>
        resolve({ labelings: results[0].data, labels: results[1].data })
      )
      .catch(err => reject(err.response));
  });
};

module.exports.addLabeling = (newLabeling, callback) => {
  return new Promise((resolve, reject) => {
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
              resolve({ labelings: lableings.data, labels: undefined });
            }
          })
          .catch(err => window.alert(err))
      )
      .catch(err => window.alert(err));
  });
};

module.exports.deleteLabeling = labelingId => {
  return new Promise((resolve, reject) => {
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
          resolve({ labelings: results[0].data, labels: results[1].data });
        })
        .catch(err => window.alert(err));
    });
  });
};

module.exports.updateLabeling = labeling => {
  return new Promise((resolve, reject) => {
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
        resolve(labelings.data, undefined);
      })
      .catch(err => window.alert(err));
  });
};

module.exports.updateLabelingAndLabels = (labeling, labels, deletedLabels) => {
  return new Promise((resolve, reject) => {
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
                apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS +
                  `/${labeling['_id']}`,
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
        ]);
      })
      .then(results => {
        resolve({ labelings: results[0].data, labels: results[1].data });
      })
      .catch(err => window.alert(err));
  });
};
