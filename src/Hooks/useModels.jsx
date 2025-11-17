import { useEffect, useState } from "react";
import {
  getModels,
  getStepOptions,
  deleteModel as deleteModel_API,
  updateModel as updateModel_API,
} from "../services/ApiServices/MlService";

const useModels = () => {
  const [models, setModels] = useState(undefined);
  const [stepOptions, setStepOptions] = useState(undefined);

  const refreshModels = async () => {
    const newModels = await getModels();
    setModels((currentModels) => {
      if (
        !currentModels ||
        JSON.stringify(currentModels) !== JSON.stringify(newModels)
      ) {
        console.log("Refreshing models");
        return newModels;
      } else {
        return currentModels;
      }
    });
  };

  const refreshStepOptions = async () => {
    const stepOpts = await getStepOptions();
    setStepOptions(stepOpts);
  };

  useEffect(() => {
    refreshStepOptions();
    refreshModels();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshModels();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const deleteModels = async (modelsToDelete) => {
    const promises = modelsToDelete.map((model) => deleteModel_API(model._id));
    await Promise.all(promises);
    refreshModels(); // Refresh after deletion
  };

  const updateModel = async (model) => {
    await updateModel_API(model);
    refreshModels();
  };

  return {
    models: models,
    stepOptions: stepOptions,
    deleteModels: deleteModels,
    updateModel: updateModel,
  };
};

export default useModels;
