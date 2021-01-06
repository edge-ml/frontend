const getAccessToken = require('../LocalStorageService').getAccessToken;
const apiConsts = require('./ApiConstants');
const ax = require('axios');
const axios = ax.create();

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
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.POST,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS,
        project
      )
    )
      .then(() => {
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.GET,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.PROJECTS
          )
        ).then(data => {
          resolve(data.data);
        });
      })

      .catch(err => reject(err.response));
  });
};

module.exports.updateProject = project => {
  console.log(project);
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
            apiConsts.API_ENDPOINTS.PROJECTS
          )
        ).then(data => {
          resolve(data.data);
        });
      })

      .catch(err => reject(err.response));
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
        axios(
          apiConsts.generateApiRequest(
            apiConsts.HTTP_METHODS.GET,
            apiConsts.API_URI,
            apiConsts.API_ENDPOINTS.PROJECTS
          )
        ).then(data => {
          resolve(data.data);
        });
      })

      .catch(err => reject(err.response));
  });
};
