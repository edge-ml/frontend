import { useContext } from 'react';
import { ProjectContext } from '../ProjectProvider';
import useProjectAPI from '../services/ApiServices/ProjectService';

const useProjectRefresh = () => {
  const { setProjects, currentProject, setCurrentProject } =
    useContext(ProjectContext);

  const projectAPI = useProjectAPI();

  const refreshProjects = async (project) => {
    const projects = await projectAPI.getProjects();
    setProjects(projects);

    var newC = projects.find((elm) => elm._id === project._id);
    if (newC) {
      setCurrentProject(newC);
      return;
    }
    var newC = projects.find((elm) => elm._id === currentProject._id);
    if (newC) {
      setCurrentProject(newC);
      return;
    }

    // Default
    if (projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  };

  return refreshProjects;
};

export default useProjectRefresh;
