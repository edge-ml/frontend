import React from "react";

import { Card, Checkbox, Group, Stack, Text } from "@mantine/core";

import Loader from "../../modules/loader";

export const TargetSensorsView = ({
  sensorStreams,
  selectedSensorStreams,
  toggleSelectedSensorStreams,
  changeAllSelectedSensorStreams,
}) => {
  return (
    <Card>
      <Text fw={700} size="lg">
        Target Sensor Streams
      </Text>
      <Stack align="flex-start" justify="space-between" mt="sm">
        <Loader loading={!sensorStreams}>
          {sensorStreams && sensorStreams.length > 0 && (
            <Checkbox
              id="select-all"
              label="Select All"
              checked={
                sensorStreams &&
                sensorStreams.length &&
                sensorStreams.every((x) => selectedSensorStreams.includes(x))
              }
              onChange={() =>
                changeAllSelectedSensorStreams(
                  !sensorStreams ||
                    !sensorStreams.every((x) =>
                      selectedSensorStreams.includes(x)
                    )
                )
              }
            />
          )}
          <Stack mt="sm" gap={8}>
            {sensorStreams && sensorStreams.length
              ? sensorStreams.map((x) => {
                  return (
                    <Checkbox
                      key={x}
                      id={x}
                      label={x}
                      checked={selectedSensorStreams.includes(x)}
                      onChange={() => toggleSelectedSensorStreams(x)}
                    />
                  );
                })
              : "There are no sensor streams defined"}
          </Stack>
        </Loader>
        <Text size="xs" mt="md">
          <Text component="span" fw={700} fs="italic">
            Note:
          </Text>{" "}
          Datasets that do not have all selected sensor streams or the target
          labeling will be dropped.
        </Text>
      </Stack>
    </Card>
  );
};
