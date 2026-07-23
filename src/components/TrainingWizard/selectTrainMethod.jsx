import React from "react";
import { Card, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import PlatformList from "../Common/PlatformList";

const getPipelinePlatforms = (pipeline) => {
  const initialStep = pipeline.steps.find((step) =>
    ["PRE", "EVAL"].includes(step.type)
  );
  let platforms = new Set(
    initialStep
      ? initialStep.options.map((option) => option.platforms).flat()
      : []
  );

  pipeline.steps.forEach((step) => {
    if (step.type === "PRE" || step.type === "CORE") {
      const supportedPlatforms = new Set(
        step.options.map((option) => option.platforms).flat()
      );
      platforms = new Set(
        [...platforms].filter((platform) => supportedPlatforms.has(platform))
      );
    }
  });

  return platforms;
};

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
          <Stack gap="md" h="100%" justify="space-between">
            <Stack gap={6}>
              <Text fw={700} size="lg">
                {pipeline.name}
              </Text>
              <Text size="sm" c="dimmed" lh={1.5}>
                {pipeline.description}
              </Text>
            </Stack>
            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" fw={600} c="dimmed">
                Supported platforms
              </Text>
              <PlatformList
                size="2rem"
                platforms={getPipelinePlatforms(pipeline)}
              />
            </Group>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  </div>
);

export default SelectTrainMethod;
