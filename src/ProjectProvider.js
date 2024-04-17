import { createContext, useEffect, useState } from 'react';
import { getProjects } from './services/ApiServices/ProjectService';

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(undefined);

  const refreshProjects = async () => {
    const projects = await getProjects();
    setProjects(projects);
    setCurrentProject(projects.length ? projects[0] : undefined);
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const onProjectClick = (project) => {
    console.log('CLICK ON PROJECT', project);
    if (currentProject && currentProject._id == project._id) {
      setCurrentProject(undefined);
    }
    setCurrentProject(project);
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
