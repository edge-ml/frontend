import create from "zustand";
import useDatasetAPI from "../services/ApiServices/DatasetServices";
import { getDatasets as getDatasets_API } from "../services/ApiServices/DatasetServices";
import useProjectStore from "./projectStore";

const useDatasetStore = create((set) => {
  return {
    datasets: undefined,
    refreshDatasets: async () => {
      const { currentProject } = useProjectStore.getState();
      const res = await getDatasets_API(currentProject);
      
      set({ datasets: res });
    },
  };
});

export default useDatasetStore;
