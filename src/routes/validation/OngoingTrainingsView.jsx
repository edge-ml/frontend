import React from "react";
import { Stack, Text } from "@mantine/core";
import { TrainingStateCounter } from "./TrainingStateCounter";

export const OngoingTrainingsView = ({ trainings }) => (
  <Stack gap="sm">
    {trainings.map((t) => (
      <div key={t.name} className="d-flex justify-content-between flex-row">
        <Text>{t.name}</Text>
        <TrainingStateCounter training={t} />
      </div>
    ))}
  </Stack>
);
