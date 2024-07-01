import { useState } from "react";
import { createProject as createProject_api } from "../services/ApiServices/ProjectService";
import useUserStore from "./useUser";

const useCreateProject = () => {
  const { user } = useUserStore();

  const [projectName, setProjectName] = useState("");
  const [projectUsers, setProjectUsers] = useState([]);

  const createProject = async () => {
    const res = await createProject_api({
      name: projectName,
      admin: user,
      users: projectUsers,
    });
  };

  const addUSer = (user) => {};

  const removeUser = (user) => {};

  return {
    createProject: createProject,
    addUser: addUSer,
    removeUser: removeUser,
    project: { name: projectName, admin: user, users: projectUsers },
    setProjectName: setProjectName,
  };
};

export default useCreateProject;
