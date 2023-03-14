import apiConsts from './ApiConstants';
import ax from 'axios';

const axios = ax.create();

export const subscribeLabelingsAndLabels = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.LABELING
      )
    )
      .then((result) => {
        console.log(result.data);
        resolve(result.data);
      })
      .catch((err) => console.log(err));
  });
};

export const addLabeling = (newLabeling) => {
  console.log(newLabeling);
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.LABELING,
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
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.LABELING + `${labelingId}`
      )
    ).then(() => {
      subscribeLabelingsAndLabels()
        .then((data) => resolve(data))
        .catch((err) => console.log(err));
    });
  });
};

export const deleteMultipleLabelings = (labelingIds) => {
  return new Promise((resolve, reject) => {
    Promise.all(
      labelingIds.map((id) =>
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.DELETE,
            apiConsts.DATASET_STORE,
            apiConsts.DATASET_STORE_ENDPOINTS.LABELING + `${id}`
          )
        )
      )
    ).then(() => {
      subscribeLabelingsAndLabels()
        .then((data) => resolve(data))
        .catch((err) => console.log(err));
    });
  });
};

export const updateLabelingandLabels = (labeling, labels) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.LABELING + `${labeling['_id']}`,
        labeling
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

// export const addLabelTypesToLabeling = (labeling, labels) => {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.POST,
//         apiConsts.API_URI,
//         apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS +
//           `/${labeling['_id']}` +
//           '/createlabeltypes',
//         labels.filter((elm) => elm.isNewLabel)
//       )
//     ).then(() => {
//       subscribeLabelingsAndLabels()
//         .then((data) => resolve(data))
//         .catch((err) => console.log(err));
//     });
//   });
// };

// export const deleteLabelTypesFromLabeling = (labeling, labels) => {
//   return new Promise((resolve, reject) => {
//     axios(
//       apiConsts.generateApiRequest(
//         apiConsts.HTTP_METHODS.POST,
//         apiConsts.API_URI,
//         apiConsts.API_ENDPOINTS.LABEL_DEFINITIONS +
//           `/${labeling['_id']}` +
//           '/deletelabeltypes',
//         labels
//       )
//     ).then(() => {
//       subscribeLabelingsAndLabels()
//         .then((data) => resolve(data))
//         .catch((err) => console.log(err));
//     });
//   });
// };
