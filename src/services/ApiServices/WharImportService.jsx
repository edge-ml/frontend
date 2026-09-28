import apiConsts from "./ApiConstants";
import apiRequest from "./request";

// Lists the standard WHAR datasets that can be imported (with metadata).
export const getWharDatasets = async () => {
  return apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.WHAR_URI,
    apiConsts.WHAR_ENDPOINTS.DATASETS
  );
};

// Starts an async import of one WHAR dataset into the current project.
// Returns { job_id }. The jwt cookie + project header are attached by request.jsx.
export const startWharImport = async (datasetId) => {
  return apiRequest(
    apiConsts.HTTP_METHODS.POST,
    apiConsts.WHAR_URI,
    apiConsts.WHAR_ENDPOINTS.IMPORT,
    { dataset_id: datasetId }
  );
};

// Polls the status of a running import job.
export const getWharImportStatus = async (jobId) => {
  return apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.WHAR_URI,
    `${apiConsts.WHAR_ENDPOINTS.IMPORT}/${jobId}/status`
  );
};
