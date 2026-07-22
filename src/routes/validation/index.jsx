import React, { useState } from "react";
import useModels from "../../Hooks/useModels";
import Loader from "../../modules/loader";
import Page from "../../components/Common/Page";
import { Button } from "@mantine/core";
import ModelTable from "./ModelTable";
import { Empty } from "../export/components/Empty";
import DeleteModal from "../../components/Common/DeleteModal";
import TrainingWizard from "../../components/TrainingWizard";

const ModelPage = () => {
  const { models, stepOptions, deleteModels, updateModel } = useModels();
  const [trainWizardOpen, setTrainWizardOpen] = useState(false);

  if (!models) {
    return <Loader loading />;
  }

  return (
    <Page
      header={
        <>
          <div className="fw-bold h4 justify-self-start">MODELS</div>
          <div className="justify-f-end">
            <Button
              variant="outline"
              onClick={() => setTrainWizardOpen(true)}
            >
              Train a model
            </Button>
          </div>
        </>
      }
    >
      {models.length === 0 && <Empty>No models trained yet</Empty>}
      {models.length > 0 && (
        <ModelTable
          models={models}
          stepOptions={stepOptions}
          updateModel={updateModel}
          deleteModels={deleteModels}
        />
      )}
      <TrainingWizard
        isOpen={trainWizardOpen}
        onClose={() => setTrainWizardOpen(false)}
      />
    </Page>
  );
};

export default ModelPage;
