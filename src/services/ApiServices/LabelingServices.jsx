import apiConsts, {
  DATASET_STORE,
  DATASET_STORE_ENDPOINTS,
  HTTP_METHODS,
} from './ApiConstants';
import ax from 'axios';
import useApiCalls from './useApiCalls';

const axios = ax.create();

const useLabelingAPI = (project) => {
  const api = useApiCalls(project);

  const getLabelingsAndLabels = async () => {
    const res = await api.request(
      HTTP_METHODS.GET,
      DATASET_STORE,
      DATASET_STORE_ENDPOINTS.LABELING,
    );
    return res;
  };

  const updateLabeling = async (labeling) => {
    const res = await api.request(
      HTTP_METHODS.PUT,
      DATASET_STORE,
      DATASET_STORE_ENDPOINTS.LABELING + `${labeling['_id']}`,
      labeling
    )
    return res;
  }

  const addLabeling = async (labeling) => {
    const res = await api.request(
      HTTP_METHODS.POST,
      DATASET_STORE,
      DATASET_STORE_ENDPOINTS.LABELING,
      labeling
    )
    return res;
  }

  const deleteLabeling = async (labeling_id) => {
    const res = await api.request(
      HTTP_METHODS.DELETE,
      DATASET_STORE,
      DATASET_STORE_ENDPOINTS.LABELING + labeling_id,
    )
    return res;
  }

  return {
    getLabelingsAndLabels: getLabelingsAndLabels,
    updateLabeling: updateLabeling,
    addLabeling: addLabeling,
    deleteLabeling: deleteLabeling
  };
};

export default useLabelingAPI;

export const subscribeLabelingsAndLabels = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.DATASET_STORE,
        apiConsts.DATASET_STORE_ENDPOINTS.LABELING,
      ),
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
        newLabeling,
      ),
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
        apiConsts.DATASET_STORE_ENDPOINTS.LABELING + `${labelingId}`,
      ),
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
            apiConsts.DATASET_STORE_ENDPOINTS.LABELING + `${id}`,
          ),
        ),
      ),
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
        labeling,
      ),
    )
      .then(() => {
        subscribeLabelingsAndLabels()
          .then((data) => resolve(data))
          .catch((err) => console.log(err));
      })
      .catch((err) => window.alert(err));
  });
};
