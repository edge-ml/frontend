const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();
const getUserIds = require('../ApiServices/AuthentificationServices')
  .getUserIds;

module.exports.getProjects = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS
      )
    )
      .then(result => {
        resolve(result.data);
      })
      .catch(err => {
        reject(err.response ? err.response.status : undefined);
      });
  });
};

module.exports.createProject = project => {
  return new Promise((resolve, reject) => {
    const tmpProject = project;
    getUserIds(project.users.map(elm => elm.userName)).then(userData => {
      tmpProject.users = userData;
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.POST,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.PROJECTS,
          project
        )
      )
        .then(() => {
          this.getProjects().then(data => resolve(data));
        })
        .catch(err => reject(err.response.data.error));
    });
  });
};

module.exports.updateProject = project => {
  return new Promise((resolve, reject) => {
    const tmpProject = project;
    getUserIds(project.users.map(elm => elm.userName))
      .then(userData => {
        tmpProject.users = userData;
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.PUT,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.PROJECTS + `/${project['_id']}`,
            project
          )
        )
          .then(() => {
            this.getProjects().then(data => resolve(data));
          })
          .catch(err => {
            reject(err.response.data.error);
          });
      })
      .catch(err => {
        reject(err.data.error);
      });
  });
};

module.exports.deleteProject = project => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS + `/${project['_id']}`
      )
    )
      .then(() => {
        this.getProjects().then(data => resolve(data));
      })
      .catch(err => reject(err.response));
  });
};

module.exports.getProjectSensorStreams = project => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS + `/${project['_id']}/sensorStreams`
      )
    ).then(x => {
      resolve(x['data'].sensorStreams);
    });
  });
};
