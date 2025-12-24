import React, { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import useModels from "../../Hooks/useModels";
import Loader from "../../modules/loader";
import Page from "../../components/Common/Page";
import ModelTable from "./ModelTable";
import { Empty } from "../export/components/Empty";
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
        <Group justify="space-between" align="center">
          <Text fw={700} size="xl">
            MODELS
          </Text>
          <Button variant="outline" onClick={() => setTrainWizardOpen(true)}>
            Train a model
          </Button>
        </Group>
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
