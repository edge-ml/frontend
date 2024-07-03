import { useEffect, useState } from "react";
import {
  getModels,
  getStepOptions,
  deleteModel as deleteModel_API,
} from "../services/ApiServices/MlService";

const useModels = () => {
  const [models, setModels] = useState(undefined);
  const [stepOptions, setStepOptions] = useState(undefined);

  const refreshModels = async () => {
    const models = await getModels();
    setModels(models);
  };

  const refreshStepOptions = async () => {
    const stepOptions = await getStepOptions();
    setStepOptions(stepOptions);
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

  const deleteModel = (model_id) => {
    deleteModel_API(model_id);
  };

  return {
    models: models,
    stepOptions: stepOptions,
  };
};

export default useModels;
