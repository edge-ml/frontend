const getAccessToken = require('../LocalStorageService').getAccessToken;
const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

axios.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

module.exports.getProjects = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS
      )
    )
      .then(result => resolve(result.data))
      .catch(err => {
        console.log(err.response);
        reject(err.response);
      });
  });
};

module.exports.updateProject = project => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.PUT,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS + `/${project['_id']}`,
        project
      )
    )
      .then(() => {
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.GET,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.PROJECTS + `/${project['_id']}`
          )
        ).then(data => {
          console.log(data);
          resolve(data.data);
        });
      })

      .catch(err => reject(err.response));
  });
};
