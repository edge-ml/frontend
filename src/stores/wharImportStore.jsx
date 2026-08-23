import create from "zustand";

// Tracks the single active WHAR import so it survives the modal being closed
// (and a page refresh): the import runs server-side, we just keep a handle to it
// and reconnect by polling. One import at a time.
const KEY = "wharImportJob";

const loadJob = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
};

const useWharImportStore = create((set) => ({
  job: loadJob(), // { jobId, datasetName, startedAt } | null
  status: null, // last polled status object from the service | null

  setJob: (job) => {
    if (job) localStorage.setItem(KEY, JSON.stringify(job));
    else localStorage.removeItem(KEY);
    set({ job });
  },
  setStatus: (status) => set({ status }),
  clear: () => {
    localStorage.removeItem(KEY);
    set({ job: null, status: null });
  },
}));

export default useWharImportStore;
