import ax from "axios";
import localStorageService from "./../LocalStorageService";
import { HTTP_METHODS, API_URI, API_ENDPOINTS } from "./ApiConstants";

const axios = ax.create();

let tauriFetch;
const isTauri = () =>
  Boolean(globalThis.isTauri || globalThis.__TAURI_INTERNALS__);

const ensureTauriFetch = async () => {
  if (isTauri() && !tauriFetch) {
    const mod = await import("@tauri-apps/plugin-http");
    tauriFetch = mod.fetch;
  }
};

const hasRequestBody = (method, body) => {
  if (method === HTTP_METHODS.GET || method === "HEAD" || body == null) {
    return false;
  }

  if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return true;
  }

  return Object.keys(body).length > 0;
};

const apiRequest = async (
  method = HTTP_METHODS.GET,
  baseUri = API_URI,
  endpoint = API_ENDPOINTS.DEFAULT,
  body = {},
  params = {},
  contentType = "application/json",
  responseType = "json"
) => {
  const url = new URL(baseUri + endpoint, window.location.origin);
  if (Object.keys(params).length > 0) {
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.append(k, v)
    );
  }

  const projectId = localStorageService.getProject();
  const headers = {
    ...(contentType && { "Content-Type": contentType }),
    Authorization: localStorageService.getAccessToken(),
    ...(projectId && { project: projectId }),
  };

  if (isTauri()) {
    await ensureTauriFetch();
    const fetchOptions = {
      method,
      headers,
    };
    if (hasRequestBody(method, body)) {
      fetchOptions.body =
        body instanceof FormData ||
        body instanceof Blob ||
        body instanceof ArrayBuffer ||
        ArrayBuffer.isView(body)
          ? body
          : JSON.stringify(body);
    }
    const response = await tauriFetch(url.toString(), fetchOptions);
    const data =
      responseType === "arraybuffer"
        ? await response.arrayBuffer()
        : responseType === "blob"
          ? await response.blob()
        : responseType === "json"
          ? await response.json()
          : await response.text();
    if (!response.ok) {
      const err = new Error(data?.error || data?.message || response.statusText);
      err.status = response.status;
      throw err;
    }
    return data;
  }

  const requestConfig = {
    method,
    url: url.toString(),
    data: body,
    headers,
    responseType,
  };

  try {
    const res = await axios(requestConfig);
    return res.data;
  } catch (error) {
    const serverMessage =
      error.response?.data?.error || error.response?.data?.message;
    const normalized = new Error(serverMessage || error.message);
    normalized.status = error.response?.status;
    throw normalized;
  }
};

export default apiRequest;
