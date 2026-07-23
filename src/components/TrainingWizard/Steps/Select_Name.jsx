import { Paper, Stack, Text, TextInput } from "@mantine/core";
import React from "react";

const Select_Name = ({ modelName, setModelName, screen }) => {
  return (
    <div className="training-wizard-step">
      <div className="training-wizard-step-header">
        <Text fw={700} size="xl">
          {screen + 1}. Model details
        </Text>
        <Text c="dimmed">
          Give the trained model a clear name so it is easy to identify later.
        </Text>
      </div>
      <Paper withBorder radius="md" p="lg">
        <Stack gap="xs" maw={420}>
          <TextInput
            label="Model name"
            placeholder="e.g. Walking activity classifier"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            error={!modelName.trim() ? "Model name is required" : undefined}
            autoFocus
          />
          <Text size="xs" c="dimmed">
            You can change this name later.
          </Text>
        </Stack>
      </Paper>
    </div>
  );
};

Select_Name.validate = ({ modelName }) => {
  if (!modelName.trim()) {
    return "Model name cannot be blank";
  }
};

export default Select_Name;
