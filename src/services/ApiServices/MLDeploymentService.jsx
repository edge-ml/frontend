import apiConsts from "./ApiConstants";
import apiRequest from "./request";

export const downloadDeploymentModel = async (
  modelId,
  format,
  compileWasm = false,
  wasmSingleFile = false
) => {
  const res = await apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    apiConsts.ML_ENDPOINTS.DEPLOY + "/" + modelId + "/download/" + format,
    null,
    { compile_wasm: compileWasm, wasm_single_file: wasmSingleFile },
    undefined,
    "blob"
  );
  return res;
};

export const downloadModalLink = async (projectId, modelId, language) =>
  apiRequest(
    apiConsts.HTTP_METHODS.GET,
    apiConsts.ML_URI,
    `models/download/${projectId}/${modelId}/${language}`,
    null,
    {},
    undefined,
    "blob"
  );
