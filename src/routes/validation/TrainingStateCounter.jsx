import React from "react";
import { Loader, Badge, Group, Text } from "@mantine/core";
import {
  faCheck,
  faHourglass,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const states = [
  ["TRAINING_INITIATED", "Training initiated"],
  ["FEATURE_EXTRACTION", "Feature extraction"],
  ["MODEL_TRAINING", "Classifier fit"],
  ["TRAINING_SUCCESSFUL", "Training successful"],
];

export const TrainingStateCounter = ({
  training: { training_state, error_msg },
}) => {
  if (training_state === "TRAINING_FAILED") {
    return (
      <Group gap="xs">
        <FontAwesomeIcon
          style={{ color: "#df4759" }}
          icon={faExclamationTriangle}
        />
        <Badge color="red">Training failed: {error_msg}</Badge>
      </Group>
    );
  }

  return (
    <Group gap="xs">
      {states.map(([k, v]) => {
        const stateIndex = states.findIndex((x) => x[0] === training_state);
        const currentIndex = states.findIndex((x) => x[0] === k);
        const isDone = currentIndex <= stateIndex && training_state !== k;
        const isCurrent = training_state === k;

        return (
          <Group key={k} gap={4} align="center">
            {isCurrent ? (
              <Loader size="xs" color="blue" />
            ) : isDone ? (
              <FontAwesomeIcon style={{ color: "#28a745" }} icon={faCheck} />
            ) : (
              <FontAwesomeIcon
                style={{ color: "#6c757d" }}
                icon={faHourglass}
              />
            )}
            <Badge
              color={isCurrent ? "blue" : isDone ? "green" : "gray"}
              variant="light"
            >
              {v}
            </Badge>
          </Group>
        );
      })}
    </Group>
  );
};
