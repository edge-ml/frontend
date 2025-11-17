import {
  getProjects as getProjects_api,
  updateProject as updateProject_api,
  deleteProject as deleteProject_api,
  leaveProject as leaveProject_api,
} from "../services/ApiServices/ProjectService";
import useProjectStore from "../stores/projectStore";

const useProjectSettings = () => {
  const { currentProject, setCurrentProject, setProjects } = useProjectStore();

  const refreshProjects = async () => {
    const projects = await getProjects_api();
    setProjects(projects);
  };

  const changeProjectName = async (projectName) => {
    const newProject = { ...currentProject, name: projectName };
    await updateProject_api(newProject);
    await refreshProjects();
  };

  const leaveProject = async () => {
    await leaveProject_api(currentProject);
    await refreshProjects();
  };

  const deleteProject = async () => {
    await deleteProject_api(currentProject._id);
    await refreshProjects();
  };

  const changeUserNames = async (userNames) => {
    const projects = await updateProject_api({
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
