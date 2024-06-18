import create from 'zustand';
import { getProjects as getProjects_API } from '../services/ApiServices/ProjectService';
import { getProject } from '../services/LocalStorageService';

const useProjectStore = create((set) => ({
    projects: undefined,
    currentProject: undefined,

    setProjects: (projects) => set({ projects }),
    setCurrentProject: (project) => set({ currentProject: project }),

    getProjects: async function() {
        const projects = await getProjects_API();
        if (projects.length > 0 && !set.currentProject) {
            set({ currentProject: projects[0] });
        }
        set({ projects });
    },
}));

export default useProjectStore;