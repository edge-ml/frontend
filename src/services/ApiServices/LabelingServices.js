var apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

module.exports.subscribeLabelingsAndLabels = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS
      )
    )
      .then(result => {
        resolve({
          labelings: result.data.labelDefinitions,
          labels: result.data.labelTypes
        });
      })
      .catch(err => console.log(err));
  });
};

module.exports.addLabeling = newLabeling => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS,
        newLabeling
      )
    )
      .then(() => {
        this.subscribeLabelingsAndLabels().then(data => resolve(data));
      })
      .catch(err => console.log(err));
  });
};

module.exports.deleteLabeling = (labelingId, conflictingDatasetIds) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS + `/${labelingId}`
      )
    ).then(() => {
      this.subscribeLabelingsAndLabels()
        .then(data => resolve(data))
        .catch(err => console.log(err));
    });
  });
};

module.exports.updateLabelingandLabels = (labeling, labels) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS + `/${labeling['_id']}`,
        { labeling: labeling, labels: labels }
      )
    )
      .then(() => {
        this.subscribeLabelingsAndLabels()
          .then(data => resolve(data))
          .catch(err => console.log(err));
      })
      .catch(err => window.alert(err));
  });
};

module.exports.addLabelTypesToLabeling = (labeling, labels) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS +
          `/${labeling['_id']}` +
          '/createlabeltypes',
        labels.filter(elm => elm.isNewLabel)
      )
    ).then(() => {
      this.subscribeLabelingsAndLabels()
        .then(data => resolve(data))
        .catch(err => console.log(err));
    });
  });
};

module.exports.deleteLabelTypesFromLabeling = (labeling, labels) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS +
          `/${labeling['_id']}` +
          '/deletelabeltypes',
        labels
      )
    ).then(() => {
      this.subscribeLabelingsAndLabels()
        .then(data => resolve(data))
        .catch(err => console.log(err));
    });
  });
};
