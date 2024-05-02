import { useContext } from 'react';
import { ProjectContext } from '../ProjectProvider';
import {
  getProjects,
  updateProject,
  deleteProject as deleteProject_API,
} from '../services/ApiServices/ProjectService';
import { switchDeviceApiActive } from '../services/ApiServices/DeviceApiService';

const useProjectSettings = () => {
  const { currentProject, setCurrentProject, setProjects } =
    useContext(ProjectContext);

  const refreshProjects = async () => {
    const projects = await getProjects();
    setProjects(projects);
  };

  const changeProjectName = async (projectName) => {
    const newProject = { ...currentProject, name: projectName };
    await updateProject(newProject);
    await refreshProjects();
  };

  const leaveProject = async () => {
    await leaveProject(currentProject);
    await refreshProjects();
  };

  const deleteProject = async () => {
    await deleteProject_API(currentProject);
    await refreshProjects();
  };

  const changeUserNames = async (userNames) => {
    const projects = await updateProject({
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
