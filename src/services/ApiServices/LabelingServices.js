import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const subscribeLabelingsAndLabels = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS
      )
    )
      .then((result) => {
        resolve({
          labelings: result.data.labelDefinitions,
          labels: result.data.labelTypes,
        });
      })
      .catch((err) => console.log(err));
  });
};

export const addLabeling = (newLabeling) => {
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
        subscribeLabelingsAndLabels().then((data) => resolve(data));
      })
      .catch((err) => console.log(err));
  });
};

export const deleteLabeling = (labelingId, conflictingDatasetIds) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS + `/${labelingId}`
      )
    ).then(() => {
      subscribeLabelingsAndLabels()
        .then((data) => resolve(data))
        .catch((err) => console.log(err));
    });
  });
};

export const deleteMultipleLabelings = (labelingIds) => {
  const requests = [];
  labelingIds.forEach((id) => {
    requests.push(
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.DELETE,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS + `/${id}`
        )
      )
    );
  });
  return new Promise((resolve, reject) => {
    Promise.all(requests)
      .then((responses) => {
        subscribeLabelingsAndLabels()
          .then((data) => resolve(data))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  });
};

export const updateLabelingandLabels = (labeling, labels) => {
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
        subscribeLabelingsAndLabels()
          .then((data) => resolve(data))
          .catch((err) => console.log(err));
      })
      .catch((err) => window.alert(err));
  });
};

export const addLabelTypesToLabeling = (labeling, labels) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS +
          `/${labeling['_id']}` +
          '/createlabeltypes',
        labels.filter((elm) => elm.isNewLabel)
      )
    ).then(() => {
      subscribeLabelingsAndLabels()
        .then((data) => resolve(data))
        .catch((err) => console.log(err));
    });
  });
};

export const deleteLabelTypesFromLabeling = (labeling, labels) => {
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
      subscribeLabelingsAndLabels()
        .then((data) => resolve(data))
        .catch((err) => console.log(err));
    });
  });
};
