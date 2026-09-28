import React from "react";
import { Card, SimpleGrid, Stack, Text } from "@mantine/core";

// Export capability depends on the classifier and steps the user picks inside
// the pipeline, so it is shown as a live "Export target" once selections are
// made (see TrainingWizard) rather than as a misleading badge on the picker.
const SelectTrainMethod = ({ pipelines, onSelectTrainingMethod }) => (
  <div className="training-wizard-step">
    <div className="training-wizard-step-header">
      <Text fw={700} size="xl">
        Choose a training pipeline
      </Text>
      <Text c="dimmed">
        Each pipeline combines preprocessing, training, and evaluation steps for
        a particular deployment workflow.
      </Text>
    </div>
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {pipelines.map((pipeline) => (
        <Card
          key={pipeline.name}
          withBorder
          radius="md"
          padding="lg"
          className="training-wizard-pipeline-card"
          onClick={() => onSelectTrainingMethod(pipeline)}
        >
          <Stack gap={6}>
            <Text fw={700} size="lg">
              {pipeline.name}
            </Text>
            <Text size="sm" c="dimmed" lh={1.5}>
              {pipeline.description}
            </Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  </div>
);

export default SelectTrainMethod;
