import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { getProjects as getProjects_API } from "../services/ApiServices/ProjectService";
import { getProject, setProject } from "../services/LocalStorageService";
import { getUserNames } from "../services/ApiServices/AuthentificationServices";

const useProjectStore = create(
  immer((set, get) => ({
    projects: undefined,
    currentProject: undefined,

    setProjects: (projects) => {
      set((state) => {
        // Attempt to find the current project in the new projects list
        const savedProjectId = getProject();
        let newCurrentProject = savedProjectId
          ? projects.find((project) => project._id === savedProjectId)
          : null;

        if (projects.length > 0 && !newCurrentProject) {
          newCurrentProject = projects[0];
        }
        state.projects = projects;
        state.currentProject = newCurrentProject;

        // Update local storage with the new current project ID
        setProject(newCurrentProject ? newCurrentProject._id : null);
      });
    },

    setCurrentProject: (project) => {
      set((state) => {
        state.currentProject = project;
      });
      setProject(project ? project._id : null);
    },

    getProjects: async function () {
      var projects = await getProjects_API();

      projects = await Promise.all(projects.map(async prj => {
        // const users = await getUserNames([prj.admin, ...prj.users]);
        // prj.admin = users[0]
        // prj.users = users.slice(1)
        return prj;
      }));
      
      console.log(projects)
      set({ projects });

      // If there's no current project set, initialize it from the projects list
      if (projects.length > 0 && !get().currentProject) {
        let currentProject = projects[0];
        const projectId = getProject();
        if (projectId) {
          currentProject =
            projects.find((project) => project._id === projectId) ||
            projects[0];
        }

        set({ currentProject });
        setProject(currentProject ? currentProject._id : null);
      }
    },
  }))
);

export default useProjectStore;
