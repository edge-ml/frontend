import React, { useState } from "react";
import useModels from "../../Hooks/useModels";
import Loader from "../../modules/loader";
import { Container } from "@mantine/core";
import ModelTable from "./ModelTable";
import TrainingWizard from "../../components/TrainingWizard";

const ModelPage = () => {
  const { models, stepOptions, deleteModels, updateModel } = useModels();
  const [trainWizardOpen, setTrainWizardOpen] = useState(false);

  if (!models) {
    return <Loader loading />;
  }

  return (
    <Container fluid p="md">
      <ModelTable
        models={models}
        stepOptions={stepOptions}
        updateModel={updateModel}
        deleteModels={deleteModels}
        onCreate={() => setTrainWizardOpen(true)}
      />
      <TrainingWizard
        isOpen={trainWizardOpen}
        onClose={() => setTrainWizardOpen(false)}
      />
    </Container>
  );
};

export default ModelPage;
