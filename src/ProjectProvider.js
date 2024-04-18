import { createContext, useEffect, useState } from 'react';
import { getProjects } from './services/ApiServices/ProjectService';
import { setProject } from './services/LocalStorageService';

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(undefined);

  const setCurrentProjectAll = (project) => {
    setProject(project._id);
    setCurrentProject(project);
  };

  const refreshProjects = async () => {
    const projects = await getProjects();
    setProjects(projects);
    setCurrentProjectAll(projects.length ? projects[0] : undefined);
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const onProjectClick = (project) => {
    console.log('CLICK ON PROJECT', project);
    if (currentProject && currentProject._id == project._id) {
      setCurrentProjectAll(undefined);
    }
    setCurrentProjectAll(project);
  };

  return (
    <ProjectContext.Provider
      value={{ projects, currentProject, onProjectClick }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectProvider, ProjectContext };
