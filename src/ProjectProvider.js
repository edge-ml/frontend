import { createContext, useEffect, useState } from 'react';
import { getProjects } from './services/ApiServices/ProjectService';
import { setProject } from './services/LocalStorageService';
import { useLocation, useNavigate } from 'react-router-dom';

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(undefined);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    console.log('Get new projects');
    let newCurrentProject = projects.find(
      (elm) => elm._id === currentProject._id,
    );
    if (!newCurrentProject) {
      newCurrentProject = projects[0];
    }
    setCurrentProject(newCurrentProject);
  }, [projects]);

  const onProjectClick = (project) => {
    if (currentProject && currentProject._id == project._id) {
      setCurrentProjectAll(undefined);
    }
    setCurrentProjectAll(project);
    const path = location.pathname.split('/');
    path[1] = project.admin.userName;
    path[2] = project.name;
    const newPath = path.join('/');
    navigate(newPath);
  };

  return (
    <ProjectContext.Provider
      value={{ projects, currentProject, onProjectClick, setProjects }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectProvider, ProjectContext };
