import React from "react";
import { Group, Paper, Stack, Text, Tooltip } from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const Hyperparameter = (props) => (
  <Paper withBorder radius="md" p="sm" h="100%">
    <Stack gap={8}>
      <Group gap={6} wrap="nowrap">
        <Text size="sm" fw={600} truncate>
          {props.display_name}
        </Text>
        <Tooltip
          label={props.description}
          position="top-start"
          multiline
          maw={280}
        >
          <span>
            <FontAwesomeIcon
              id={"hyperparameter" + props.parameter_name}
              style={{ color: "var(--mantine-color-gray-6)" }}
              icon={faInfoCircle}
              size="sm"
            />
          </span>
        </Tooltip>
      </Group>
      <div style={{ width: "100%" }}>{props.children}</div>
    </Stack>
  </Paper>
);

export default Hyperparameter;
