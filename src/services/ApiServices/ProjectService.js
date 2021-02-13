const getAccessToken = require('../LocalStorageService').getAccessToken;
const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();
const getUserIds = require('../ApiServices/AuthentificationServices')
  .getUserIds;

function getUserMails(project) {
  const userList = [project.admin, ...project.users];
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.AUTH_URI,
        apiConsts.AUTH_ENDPOINTS.MAIL,
        userList
      )
    )
      .then(result => {
        project.admin = result.data[0];
        result.data.shift();
        project.users = result.data;
        resolve(project);
      })
      .catch(err => reject(err.response));
  });
}

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
        var promises = result.data.map(elm => {
          return elm.users ? getUserMails(elm) : Promise.resolve(elm);
        });
        Promise.all(promises).then(result => {
          resolve(result);
        });
      })
      .catch(err => {
        reject(err.response);
      });
  });
};

module.exports.createProject = project => {
  return new Promise((resolve, reject) => {
    const tmpProject = project;
    getUserIds(project.users.map(elm => elm.email)).then(userData => {
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
    getUserIds(project.users.map(elm => elm.email)).then(userData => {
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
