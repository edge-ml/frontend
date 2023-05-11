import apiConsts from './ApiConstants';
import ax from 'axios';
import { getUserIds } from '../ApiServices/AuthentificationServices';

const axios = ax.create();

export const getProjects = () => {
  return new Promise((resolve, reject) => {
    console.log(apiConsts.API_URI);
    console.log(apiConsts.API_ENDPOINTS.PROJECTS);
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS
      )
    )
      .then((result) => {
        resolve(result.data);
      })
      .catch((err) => {
        reject(err.response ? err.response.status : undefined);
      });
  });
};

export const createProject = (project) => {
  return new Promise((resolve, reject) => {
    const tmpProject = project;
    getUserIds(project.users.map((elm) => elm.userName)).then((userData) => {
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
          getProjects().then((data) => resolve(data));
        })
        .catch((err) => {
          reject(err.response.data.error);
        });
    });
  });
};

export const updateProject = (project) => {
  return new Promise((resolve, reject) => {
    const tmpProject = project;
    getUserIds(project.users.map((elm) => elm.userName))
      .then((userData) => {
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
            getProjects().then((data) => resolve(data));
          })
          .catch((err) => {
            reject(err.response.data.error);
          });
      })
      .catch((err) => {
        reject(err.data.error);
      });
  });
};

export const deleteProject = (project) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.DELETE,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS + `/${project['_id']}`
      )
    )
      .then(() => {
        getProjects().then((data) => resolve(data));
      })
      .catch((err) => reject(err.response));
  });
};

export const leaveProject = (project) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS + `/${project['_id']}` + '/leave'
      )
    )
      .then(() => {
        getProjects().then((data) => resolve(data));
      })
      .catch((err) => reject(err.response));
  });
};

export const getProjectSensorStreams = (project) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS + `/${project['_id']}/sensorStreams`
      )
    ).then((x) => {
      resolve(x['data'].sensorStreams);
    });
  });
};

export const getProjectCustomMetaData = (project) => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.PROJECTS + `/${project['_id']}/customMetaData`
      )
    ).then((x) => {
      resolve(x['data']);
    });
  });
};
