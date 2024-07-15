import React, { useState } from "react";
import useModels from "../../Hooks/useModels";
import Loader from "../../modules/loader";
import Page from "../../components/Common/Page";
import { Button } from "reactstrap";
import ModelTable from "./ModelTable";
import { Empty } from "../export/components/Empty";
import DeleteModal from "../../components/Common/DeleteModal";
import TrainingWizard from "../../components/TrainingWizard";

const ModelPage = () => {
  const { models, stepOptions, deleteModels, updateModel } = useModels();
  const [trainWizardOpen, setTrainWizardOpen] = useState(false);

  if (!models) {
    return <Loader loading></Loader>;
  }

  return (
    <Page
      header={
        <>
          <div className="fw-bold h4 justify-self-start">MODELS</div>
          <div className="justify-f-end">
            <Button
              outline
              color="primary"
              className="btn-neutral"
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
        ></ModelTable>
      )}
      <TrainingWizard
        isOpen={trainWizardOpen}
        onClose={() => setTrainWizardOpen(false)}
      ></TrainingWizard>
    </Page>
  );
};

export default ModelPage;
