import {
  getProjects as getProjects_api,
  updateProject as updateProject_api,
  deleteProject as deleteProject_api,
  leaveProject as leaveProject_api,
  addProjectUser as addProjectUser_api,
  removeProjectUser as removeProjectUser_api,
} from "../services/ApiServices/ProjectService";
import useProjectStore from "../stores/projectStore";

const useProjectSettings = () => {
  const { currentProject, setProjects } = useProjectStore();

  const refreshProjects = async () => {
    const projects = await getProjects_api();
    setProjects(projects);
  };

  const changeProjectName = async (projectName) => {
    const newProject = { id: currentProject.id, name: projectName };
    await updateProject_api(newProject);
    await refreshProjects();
  };

  const leaveProject = async () => {
    await leaveProject_api(currentProject.id);
    await refreshProjects();
  };

  const deleteProject = async () => {
    await deleteProject_api(currentProject.id);
    await refreshProjects();
  };

  const changeUserNames = async (userNames) => {
    const nextUserNames = Array.from(
      new Set((userNames || []).map((user) => user?.trim()).filter(Boolean))
    );
    const currentUserNames = (currentProject.users || [])
      .map((user) => user?.userName ?? user?.username)
      .filter(Boolean);
    const adminUserName =
      currentProject.admin?.userName ?? currentProject.admin?.username;

    for (const userName of nextUserNames) {
      if (!currentUserNames.includes(userName)) {
        await addProjectUser_api(currentProject.id, userName);
      }
    }

    for (const userName of currentUserNames) {
      if (userName === adminUserName) {
        continue;
      }
      if (!nextUserNames.includes(userName)) {
        await removeProjectUser_api(currentProject.id, userName);
      }
    }

    await refreshProjects();
  };

  const addProjectUser = async (username) => {
    await addProjectUser_api(currentProject.id, username);
    await refreshProjects();
  };

  const removeProjectUser = async (username) => {
    await removeProjectUser_api(currentProject.id, username);
    await refreshProjects();
  };

  return {
    changeProjectName: changeProjectName,
    changeUserNames: changeUserNames,
    addProjectUser: addProjectUser,
    removeProjectUser: removeProjectUser,
    deleteProject: deleteProject,
    leaveProject: leaveProject,
  };
};

export default useProjectSettings;
