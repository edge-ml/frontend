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
    .catch(err => window.alert(err));
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
  )
    .then(
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
          accessToken
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
      accessToken,
      labeling
    )
  )
    .then(() =>
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
          accessToken
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
            accessToken,
            label
          )
        )
      )
  )
    .then(newLabels => {
      console.log(newLabels);
      let newLabelsId = newLabels.map(label => label.data['_id']);
      labeling.labels = [...labeling.labels, ...newLabelsId];
      console.log(labeling);
      let promises = [];
      if (!labeling['_id']) {
        promises = [
          ...promises,
          axios(
            apiConsts.generateApiRequest(
              apiConsts.HTTP_METHODS.POST,
              apiConsts.API_URI,
              apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
              accessToken,
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
              accessToken,
              labeling
            )
          ),
          ...updatedLabels.map(label =>
            axios(
              apiConsts.generateApiRequest(
                apiConsts.HTTP_METHODS.PUT,
                apiConsts.API_URI,
                apiConsts.API_ENDPOINTS.LABEL_TYPES + `/${label['_id']}`,
                accessToken,
                label
              )
            )
          ),
          ...deletedLabels.map(labelId =>
            axios(
              apiConsts.generateApiRequest(
                apiConsts.HTTP_METHODS.DELETE,
                apiConsts.API_URI,
                apiConsts.API_ENDPOINTS.LABEL_TYPES + `/${labelId}`,
                accessToken
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
