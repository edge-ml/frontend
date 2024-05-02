import { createContext, useEffect, useState } from 'react';
import { setProject } from './services/LocalStorageService';
import { useLocation, useNavigate } from 'react-router-dom';
import useProjectAPI from './services/ApiServices/ProjectService';

const ProjectContext = createContext();

const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(undefined);
  const navigate = useNavigate();
  const location = useLocation();
  const projectAPI = useProjectAPI();

  useEffect(() => {
    if (currentProject) {
      setProject(currentProject._id);
    }
  }, [currentProject]);

  const refreshProjects = async () => {
    const projects = await projectAPI.getProjects();
    setProjects(projects);
    setCurrentProject(projects.length ? projects[0] : undefined);
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
      setCurrentProject(undefined);
    }
    setCurrentProject(project);
    const path = location.pathname.split('/');
    path[1] = project.admin.userName;
    path[2] = project.name;
    const newPath = path.join('/');
    navigate(newPath);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        onProjectClick,
        setProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectProvider, ProjectContext };
