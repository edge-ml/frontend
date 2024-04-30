import { useContext } from 'react';
import { ProjectContext } from '../ProjectProvider';
import { updateProject } from '../services/ApiServices/ProjectService';

const useProjectSettings = () => {
  const currentProject = useContext(ProjectContext);

  const changeProjectName = async (projectName) => {
    await updateProject({ ...currentProject, name: projectName });
  };

  const leaveProject = async () => {};

  const deleteProject = async () => {};

  const enableDeviceApi = async () => {};

  const changeUserNames = async (userNames) => {
    await updateProject({ ...currentProject, userNames: userNames });
  };

  return {
    changeProjectName: changeProjectName,
    changeUserNames: changeUserNames,
  };
};

export default useProjectSettings;
