import React from "react";
import { Group, Text } from "@mantine/core";
import { TrainingStateCounter } from "./TrainingStateCounter";

export const OngoingTrainingsView = ({ trainings }) => (
  <div>
    {trainings.map((t) => (
      <Group key={t.id || t.name} justify="space-between">
        <Text>{t.name}</Text>
        <TrainingStateCounter training={t} />
      </Group>
    ))}
  </div>
);
