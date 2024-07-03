import { useState } from "react";
import { createProject as createProject_api } from "../services/ApiServices/ProjectService";
import useUserStore from "./useUser";
import useProjectStore from "../stores/projectStore";


const useCreateProject = () => {
  const { user } = useUserStore();
  const getProjects = useProjectStore((state) => state.getProjects);

  const [projectName, setProjectName] = useState("");
  const [projectUsers, setProjectUsers] = useState([]);

  const createProject = async () => {
    const res = await createProject_api({
      name: projectName,
      admin: user,
      users: projectUsers,
    });
    getProjects();
  };

  const addUSer = (e) => {
    setProjectUsers([...projectUsers, {"userName": e.target.value}]);
  };

  const removeUser = (userName) => {
    setProjectUsers(projectUsers.filter((user) => user.userName !== userName));
  };

  return {
    createProject: createProject,
    addUser: addUSer,
    removeUser: removeUser,
    project: { name: projectName, admin: user, users: projectUsers },
    setProjectName: setProjectName,
  };
};

export default useCreateProject;
