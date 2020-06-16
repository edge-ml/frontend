module.exports = {
  AUTH_URI: 'http://aura.dmz.teco.edu/auth/',
  API_URI: 'http://aura.dmz.teco.edu/api/',

  HTTP_METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
  },

  AUTH_ENDPOINTS: {
    DEFAULT: '/',
    LOGIN: 'login',
    DELETE: 'unregister',
    REGISTER: 'register'
  },
  API_ENDPOINTS: {
    DATASETS: 'datasets'
  },

  generateRequest: generateRequest
};

function generateRequest(
  method = this.HTTP_METHODS.GET,
  baseUri = this.API_URI,
  endpoint = this.API_ENDPOINTS.DEFAULT,
  body = {}
) {
  return {
    method: method,
    url: baseUri + endpoint,
    data: body,
    headers: {
      'Content-Type': 'application/json'
    }
  };
}
