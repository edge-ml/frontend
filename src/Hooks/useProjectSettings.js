import { useContext } from 'react';
import { ProjectContext } from '../ProjectProvider';
import { updateProject } from '../services/ApiServices/ProjectService';

const useProjectSettings = () => {
  const { currentProject, setProjects } = useContext(ProjectContext);

  const changeProjectName = async (projectName) => {
    await updateProject({ ...currentProject, name: projectName });
  };

  const leaveProject = async () => {};

  const deleteProject = async () => {};

  const enableDeviceApi = async () => {};

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
  };
};

export default useProjectSettings;
