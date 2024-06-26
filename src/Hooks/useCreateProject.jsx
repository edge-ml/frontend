import { useContext, useState } from 'react';
import useProjectAPI from '../services/ApiServices/ProjectService';
import { AuthContext } from '../AuthProvider';
import useAuth from './useAuth';
import useUserStore from './useUser';

const useCreateProject = () => {
  const { user } = useUserStore();

  const [projectName, setProjectName] = useState('');
  const [projectUsers, setProjectUsers] = useState([]);

  const projectAPI = useProjectAPI();

  const createProject = async () => {
    const res = await projectAPI.createProject({
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
