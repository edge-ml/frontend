import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { getProjects as getProjects_API } from "../services/ApiServices/ProjectService";
import { getProject, setProject } from "../services/LocalStorageService";

const useProjectStore = create(
  immer((set, get) => ({
    projects: undefined,
    currentProject: undefined,

    setProjects: (projects) => {
      set((state) => {
        // Attempt to find the current project in the new projects list
        const savedProjectId = getProject();
        let newCurrentProject = savedProjectId
          ? projects.find((project) => project.id === savedProjectId)
          : null;

        if (projects.length > 0 && !newCurrentProject) {
          newCurrentProject = projects[0];
        }
        state.projects = projects;
        state.currentProject = newCurrentProject;

        // Update local storage with the new current project ID
        setProject(newCurrentProject ? newCurrentProject.id : null);
      });
    },

    setCurrentProject: (project) => {
      set((state) => {
        state.currentProject = project;
      });
      setProject(project ? project.id : null);
    },

    getProjects: async function () {
      const projects = await getProjects_API();
      get().setProjects(projects);
    },
  }))
);

export default useProjectStore;
