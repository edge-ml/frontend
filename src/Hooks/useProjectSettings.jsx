import { useContext } from 'react';
import useProjectAPI from '../services/ApiServices/ProjectService';
import { switchDeviceApiActive } from '../services/ApiServices/DeviceApiService';
import useProjectStore from '../stores/projectStore';

const useProjectSettings = () => {
  const { currentProject, setCurrentProject, setProjects } = useProjectStore();

  const projectAPI = useProjectAPI();

  const refreshProjects = async () => {
    const projects = await projectAPI.getProjects();
    setProjects(projects);
  };

  const changeProjectName = async (projectName) => {
    const newProject = { ...currentProject, name: projectName };
    await projectAPI.updateProject(newProject);
    await refreshProjects();
  };

  const leaveProject = async () => {
    await projectAPI.leaveProject(currentProject);
    await refreshProjects();
  };

  const deleteProject = async () => {
    await projectAPI.deleteProject(currentProject);
    await refreshProjects();
  };

  const changeUserNames = async (userNames) => {
    const projects = await projectAPI.updateProject({
      ...currentProject,
      userNames: userNames,
    });
    setProjects(projects);
  };

  return {
    changeProjectName: changeProjectName,
    changeUserNames: changeUserNames,
    deleteProject: deleteProject,
  };
};

export default useProjectSettings;
