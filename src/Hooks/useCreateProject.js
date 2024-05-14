import { useContext, useState } from 'react';
import useProjectAPI from '../services/ApiServices/ProjectService';
import useProjectRefresh from './useProjectsRefresh';
import { AuthContext } from '../AuthProvider';
import useAuth from './useAuth';

const useCreateProject = () => {
  const { user } = useAuth();

  const [projectName, setProjectName] = useState('');
  const [projectUsers, setProjectUsers] = useState([]);

  const projectAPI = useProjectAPI();
  const refreshProjects = useProjectRefresh();

  const createProject = async () => {
    const res = await projectAPI.createProject({
      name: projectName,
      admin: user,
      users: projectUsers,
    });
    console.log(res);
    await refreshProjects(res);
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
