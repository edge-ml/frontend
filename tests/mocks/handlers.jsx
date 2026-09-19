import { HttpResponse, http } from 'msw';
import apiConsts from '../../src/services/ApiServices/ApiConstants';

const {
  AUTH_URI,
  API_URI,
  ML_URI,
  DATASET_STORE,
  WHAR_URI,
} = apiConsts;

// Default fixtures used across the test suite. Individual tests can override
// them per-test with `server.use(...)`.
export const fixtures = {
  user: { email: 'test@edge-ml.org', userName: 'tester', id: 'user-1' },
  project: {
    _id: 'project-1',
    name: 'Test Project',
    admin: 'user-1',
    users: ['user-2'],
  },
  dataset: {
    _id: 'dataset-1',
    name: 'Test Dataset',
    timeSeries: [],
    labelings: [],
    metaData: {},
  },
  model: { _id: 'model-1', name: 'Test Model' },
};

const json = (data) => HttpResponse.json(data);

export const handlers = [
  // ---- Auth service -------------------------------------------------------
  http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.LOGIN}`, () =>
    json({
      access_token: makeToken({ email: 'a@b.c', userName: 'u', id: 'u1' }),
      refresh_token: 'refresh-token',
    })
  ),
  http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.REFRESH}`, () =>
    json({ access_token: 'new-access', refresh_token: 'new-refresh' })
  ),
  http.get(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.USER}`, () => json(fixtures.user)),
  http.get(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.LOGOUT}`, () => json({ success: true })),
  http.get(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.MAIL}`, () => json('test@edge-ml.org')),
  http.put(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.CHANGE_MAIL}`, () => json({ success: true })),
  http.put(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.CHANGE_USERNAME}`, () => json({ success: true })),
  http.put(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.CHANGE_PASSWORD}`, () => json({ success: true })),
  http.delete(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.DELETE}`, () => json({ success: true })),
  http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.REGISTER}`, () => json({ success: true })),
  http.get(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.USERS}`, () =>
    json(['user-1', 'user-2'])
  ),
  http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.USERNAME}`, () =>
    json(['Admin', 'User'])
  ),
  http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.ID}`, () =>
    json(['id-1', 'id-2'])
  ),
  http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.USERNAMESUGGEST}`, () =>
    json(['suggestion_1'])
  ),

  // ---- Backend API service -------------------------------------------------
  http.get(`${API_URI}${apiConsts.API_ENDPOINTS.PROJECTS}`, () =>
    json([fixtures.project])
  ),
  http.post(`${API_URI}${apiConsts.API_ENDPOINTS.PROJECTS}`, () =>
    json(fixtures.project)
  ),
  http.put(`${API_URI}${apiConsts.API_ENDPOINTS.PROJECTS}/*`, () =>
    json(fixtures.project)
  ),
  http.delete(`${API_URI}${apiConsts.API_ENDPOINTS.PROJECTS}/*`, () =>
    json({ success: true })
  ),
  http.get(`${API_URI}${apiConsts.API_ENDPOINTS.DEVICE}/*`, () =>
    json({ name: 'device', generation: 'gen1' })
  ),
  http.get(`${API_URI}${apiConsts.API_ENDPOINTS.SETDEVICEAPIKEY}`, () =>
    json({ apiKey: 'key' })
  ),
  http.get(`${API_URI}${apiConsts.API_ENDPOINTS.GETDEVICEAPIKEY}`, () =>
    json({ apiKey: 'key' })
  ),
  http.get(`${API_URI}${apiConsts.API_ENDPOINTS.REMOVEDEVICEAPIKEY}`, () =>
    json({ success: true })
  ),
  http.post(`${API_URI}${apiConsts.API_ENDPOINTS.SWTICHDEVICEAPIACTIVE}`, () =>
    json({ active: true })
  ),
  http.get(`${API_URI}${apiConsts.API_ENDPOINTS.ARDUINOFIRMWARE}/*`, () =>
    new HttpResponse(new ArrayBuffer(8), {
      headers: { 'Content-Type': 'application/octet-stream' },
    })
  ),

  // ---- Dataset store -------------------------------------------------------
  http.get(DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.DATASETS, () =>
    json([fixtures.dataset])
  ),
  http.get(
    DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + '*view',
    () => json([fixtures.dataset])
  ),
  http.post(DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + '/create*', () =>
    json(fixtures.dataset)
  ),
  http.post(
    DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.DATASETS + '*/append',
    () => json({ success: true })
  ),
  http.put(
    DATASET_STORE +
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
      '*/changeUnitConfig*',
    () => json({ success: true })
  ),
  http.get(
    DATASET_STORE +
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
      '*ts/*/*/*/*',
    () => json([[0, 0]])
  ),
  http.post(
    DATASET_STORE +
      apiConsts.DATASET_STORE_ENDPOINTS.DATASETS +
      '*ts/*/*/*',
    () => json([[0, 0]])
  ),
  http.put(
    `${DATASET_STORE}${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}*`,
    ({ params }) => json({ success: true })
  ),
  http.post(
    `${DATASET_STORE}${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}*`,
    () => json(fixtures.dataset)
  ),
  http.get(
    `${DATASET_STORE}${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}*`,
    () => json(fixtures.dataset)
  ),
  http.get(
    DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.GET_PROCESSING_PROGRESS,
    () => json({ progress: 100 })
  ),
  http.delete(
    `${DATASET_STORE}${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}*`,
    () => json({ success: true })
  ),
  http.post(
    DATASET_STORE +
      apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS +
      '*',
    () => json({ success: true })
  ),
  http.put(
    DATASET_STORE +
      apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS +
      '*',
    () => json({ success: true })
  ),
  http.delete(
    DATASET_STORE +
      apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS +
      '*',
    () => json({ success: true })
  ),
  http.get(
    DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.LABELING,
    () => json([{ _id: 'labeling-1', name: 'Labeling' }])
  ),
  http.post(
    DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.LABELING,
    () => json({ _id: 'labeling-1', name: 'Labeling' })
  ),
  http.put(
    DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.LABELING + '*',
    () => json({ success: true })
  ),
  http.delete(
    DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.LABELING + '*',
    () => json({ success: true })
  ),
  http.post(DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.CSV + '*', () =>
    json({ downloadId: 'dl-1' })
  ),
  http.get(DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.CSV + '*', () =>
    new HttpResponse('zip-bytes', {
      headers: { 'Content-Type': 'application/zip' },
    })
  ),
  http.delete(DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.CSV + '*', () =>
    json({ success: true })
  ),

  // ---- ML service ----------------------------------------------------------
  http.get(ML_URI + apiConsts.ML_ENDPOINTS.MODELS, () => json([fixtures.model])),
  http.post(ML_URI + apiConsts.ML_ENDPOINTS.TRAIN + '*', () => json({ jobId: 'job-1' })),
  http.get(ML_URI + apiConsts.ML_ENDPOINTS.TRAIN, () => json({ steps: [] })),
  http.get(ML_URI + apiConsts.ML_ENDPOINTS.TRAIN + '/pipeline/options', () =>
    json({ options: [] })
  ),
  http.get(ML_URI + apiConsts.ML_ENDPOINTS.DEPLOY + '/*', () =>
    json([{ deviceName: 'nano_33_iot' }])
  ),
  http.post(ML_URI + apiConsts.ML_ENDPOINTS.DEPLOY + '*', () =>
    new HttpResponse(new ArrayBuffer(16), {
      headers: { 'Content-Type': 'application/octet-stream' },
    })
  ),
  http.get(ML_URI + '*', () => json(fixtures.model)),

  // ---- WHAR service --------------------------------------------------------
  http.get(WHAR_URI + apiConsts.WHAR_ENDPOINTS.DATASETS, () =>
    json([
      { dataset_id: 'whar-1', name: 'WharDataset', num_samples: 100 },
    ])
  ),
  http.post(WHAR_URI + apiConsts.WHAR_ENDPOINTS.IMPORT, () =>
    json({ job_id: 'job-42' })
  ),
  http.get(WHAR_URI + apiConsts.WHAR_ENDPOINTS.IMPORT + '/*/status', () =>
    json({ state: 'running', progress: 0.5 })
  ),

  // ---- GitHub (latest firmware version) ------------------------------------
  http.get('https://api.github.com/repos/edge-ml/EdgeML-Arduino/tags', () =>
    json([{ name: 'v1.2.3' }])
  ),
];

// Helper: create a fake JWT that jwt-decode can parse (used by auth store tests).
export function makeToken(payload) {
  const encode = (obj) =>
    globalThis.btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${encode({ alg: 'none' })}.${encode(payload)}.`;
}
