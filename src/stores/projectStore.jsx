import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getProjects as getProjects_API } from '../services/ApiServices/ProjectService';
import { getProject } from '../services/LocalStorageService';

const useProjectStore = create(
  immer((set, get) => ({
    projects: undefined,
    currentProject: undefined,

    setProjects: (projects) => {
      set((state) => {
        const newCurrentProject = state.currentProject
          ? projects.find((project) => project._id === state.currentProject._id)
          : null;
        state.currentProject = newCurrentProject;
        state.projects = projects;
      });
    },

    setCurrentProject: (project) => set({ currentProject: project }),

    getProjects: async function () {
      const projects = await getProjects_API();
      if (projects.length > 0 && !get().currentProject) {
        set({ currentProject: projects[0] });
      }
      set({ projects });
    },
  }))
);

export default useProjectStore;
