import { useEffect, useState } from "react";
import useProjectStore from "../stores/projectStore";
import {
  getLabelings as getLabelings_api,
  updateLabeling as updateLabeling_api,
  addLabeling as addLabeling_api,
  deleteLabeling as deleteLabelings_api,
} from "../services/ApiServices/LabelingServices";

const useLabelings = () => {
  const { currentProject } = useProjectStore();

  const [labelings, setLabelings] = useState(undefined);

  const refreshLabelings = async () => {
    try {
      const data = await getLabelings_api();
      setLabelings(data);
    } catch (error) {
      console.error("[useLabelings] Failed to load labelings:", error);
      // Keep any data we already have, but never leave the page stuck on its
      // loading state when the first request fails.
      setLabelings((previous) => previous ?? []);
    }
  };

  const updateLabeling = async (labeling) => {
    await updateLabeling_api(labeling);
    refreshLabelings();
  };

  const addLabeling = async (labeling) => {
    await addLabeling_api(labeling);
    refreshLabelings();
  };

  const deleteLabeling = async (labeling_id) => {
    await deleteLabelings_api(labeling_id);
    refreshLabelings();
  };

  useEffect(() => {
    refreshLabelings();
  }, [currentProject]);

  return { labelings, updateLabeling, addLabeling, deleteLabeling };
};

export default useLabelings;
