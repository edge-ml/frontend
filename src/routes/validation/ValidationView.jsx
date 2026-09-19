import React from "react";
import { Card, Text, Stack } from "@mantine/core";

export const ValidationView = ({ ongoing, trained }) => {
  return (
    <Stack gap="md" p="md">
      {ongoing && (
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Text fw={700} size="lg" mb="sm">
            Ongoing Trainings
          </Text>
          {ongoing}
        </Card>
      )}
      {trained}
    </Stack>
  );
};
