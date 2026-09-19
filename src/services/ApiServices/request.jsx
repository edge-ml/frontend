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

  if (Array.isArray(body)) {
    return body.length > 0;
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
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  }

  const projectId = localStorageService.getProject();
  const headers = {
    ...(contentType && { "Content-Type": contentType }),
    ...(localStorageService.getAuthHeader() && {
      Authorization: localStorageService.getAuthHeader(),
    }),
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

    // Check the status before decoding. An error response does not follow the
    // requested responseType: a gateway returns HTML, an expired token returns
    // an empty body, and a failed blob download returns JSON. Decoding those
    // as the caller asked would throw a SyntaxError and lose both the status
    // code and the server's message, so read errors as text and parse
    // defensively, mirroring the axios branch below.
    if (!response.ok) {
      let serverMessage;
      try {
        const raw = await response.text();
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            serverMessage = parsed?.detail || parsed?.error || parsed?.message;
          } catch (_) {
            /* not JSON: fall back to the status text */
          }
        }
      } catch (_) {
        /* body unreadable */
      }
      const err = new Error(
        serverMessage ||
          response.statusText ||
          `Request failed with status code ${response.status}`
      );
      err.status = response.status;
      throw err;
    }

    return responseType === "arraybuffer"
      ? await response.arrayBuffer()
      : responseType === "blob"
        ? await response.blob()
        : responseType === "json"
          ? await response.json()
          : await response.text();
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
    // Surface the backend's error message instead of axios' generic
    // "Request failed with status code 500".
    let data = error.response?.data;
    // For blob responses (e.g. model downloads) the error body is a Blob, so the
    // fields below are undefined; read and parse it to recover the real message.
    if (data instanceof Blob) {
      try {
        data = JSON.parse(await data.text());
      } catch (_) {
        data = undefined;
      }
    }
    const serverMessage = data?.detail || data?.error || data?.message;
    const normalized = new Error(serverMessage || error.message);
    normalized.status = error.response?.status;
    throw normalized;
  }
};

export default apiRequest;
