import apiConsts, { ML_URI } from './ApiConstants';
import ax from 'axios';
import apiRequest from './request';


export const downloadDeploymentModel = async (
  modelId,
  format,
  compileWasm = false,
  wasmSingleFile = false,
) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.DEPLOY + '/' + modelId + '/download/' + format,
    null,
    { compile_wasm: compileWasm, wasm_single_file: wasmSingleFile },
    "blob"
  );
  return res;
}

export const downloadModalLink = (project_id, model_id, language) => {
  window.open(`${ML_URI}models/download/${project_id}/${model_id}/${language}`);
};
