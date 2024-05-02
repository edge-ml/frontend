import { getUserIds } from '../ApiServices/AuthentificationServices';
import { HTTP_METHODS, API_URI, API_ENDPOINTS } from './ApiConstants';
import useApiCalls from './useApiCalls';

const useProjectAPI = (project) => {
  const api = useApiCalls(project);

  const getProjects = async () => {
    const res = await api.request(
      HTTP_METHODS.GET,
      API_URI,
      API_ENDPOINTS.PROJECTS,
    );
    return res;
  };

  const updateProject = async (project) => {
    const tmpProject = { ...project };
    const userData = await getUserIds(project.users.map((elm) => elm.userName));
    tmpProject.users = userData;

    const res = await api.request(
      HTTP_METHODS.PUT,
      API_URI,
      API_ENDPOINTS.PROJECTS + `/${project['_id']}`,
      project,
    );
    return res;
  };

  // export const createProject = (project) => {
  //   return new Promise((resolve, reject) => {
  //     const tmpProject = project;
  //     getUserIds(project.users.map((elm) => elm.userName)).then((userData) => {
  //       tmpProject.users = userData;
  //       axios(
  //         apiConsts.generateApiRequest(
  //           apiConsts.HTTP_METHODS.POST,
  //           apiConsts.API_URI,
  //           apiConsts.API_ENDPOINTS.PROJECTS,
  //           project
  //         )
  //       )
  //         .then(() => {
  //           getProjects().then((data) => resolve(data));
  //         })
  //         .catch((err) => {
  //           reject(err.response.data.error);
  //         });
  //     });
  //   });
  // };

  // export const updateProject = async (project) => {
  //   try {
  //     const tmpProject = { ...project };
  //     const userData = await getUserIds(
  //       project.users.map((elm) => elm.userName)
  //     );
  //     tmpProject.users = userData;

  //     const requestConfig = apiConsts.generateApiRequest(
  //       apiConsts.HTTP_METHODS.PUT,
  //       apiConsts.API_URI,
  //       apiConsts.API_ENDPOINTS.PROJECTS + `/${project["_id"]}`,
  //       project
  //     );

  //     await axios(requestConfig);
  //     return;
  //   } catch (error) {
  //     throw error.response?.data?.error || error.data?.error || error;
  //   }
  // };

  // export const deleteProject = (project) => {
  //   return new Promise((resolve, reject) => {
  //     axios(
  //       apiConsts.generateApiRequest(
  //         apiConsts.HTTP_METHODS.DELETE,
  //         apiConsts.API_URI,
  //         apiConsts.API_ENDPOINTS.PROJECTS + `/${project["_id"]}`
  //       )
  //     )
  //       .then(() => {
  //         getProjects().then((data) => resolve(data));
  //       })
  //       .catch((err) => reject(err.response));
  //   });
  // };

  // export const leaveProject = (project) => {
  //   return new Promise((resolve, reject) => {
  //     axios(
  //       apiConsts.generateApiRequest(
  //         apiConsts.HTTP_METHODS.GET,
  //         apiConsts.API_URI,
  //         apiConsts.API_ENDPOINTS.PROJECTS + `/${project["_id"]}` + "/leave"
  //       )
  //     )
  //       .then(() => {
  //         getProjects().then((data) => resolve(data));
  //       })
  //       .catch((err) => reject(err.response));
  //   });
  // };

  // export const getProjectSensorStreams = (project) => {
  //   return new Promise((resolve, reject) => {
  //     axios(
  //       apiConsts.generateApiRequest(
  //         apiConsts.HTTP_METHODS.GET,
  //         apiConsts.API_URI,
  //         apiConsts.API_ENDPOINTS.PROJECTS + `/${project["_id"]}/sensorStreams`
  //       )
  //     ).then((x) => {
  //       resolve(x["data"].sensorStreams);
  //     });
  //   });
  // };

  // export const getProjectCustomMetaData = (project) => {
  //   return new Promise((resolve, reject) => {
  //     axios(
  //       apiConsts.generateApiRequest(
  //         apiConsts.HTTP_METHODS.GET,
  //         apiConsts.API_URI,
  //         apiConsts.API_ENDPOINTS.PROJECTS + `/${project["_id"]}/customMetaData`
  //       )
  //     ).then((x) => {
  //       resolve(x["data"]);
  //     });
  //   });
  // };
  return {
    getProjects: getProjects,
    updateProject: updateProject,
  };
};

export default useProjectAPI;
