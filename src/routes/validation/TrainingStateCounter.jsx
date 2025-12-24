import React from "react";
import { Badge, Group, Loader, Text } from "@mantine/core";
import {
  faCheck,
  faHourglass,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const states = Object.entries({
  TRAINING_INITIATED: "Training initiated",
  FEATURE_EXTRACTION: "Feature extraction",
  MODEL_TRAINING: "Classifier fit",
  TRAINING_SUCCESSFUL: "Training successful",
});

const BS_SUCCESS = "#28a745"; // TODO: find a better way
const BS_SECONDARY = "#6c757d";
const BS_FAILURE = "#df4759";

export const TrainingStateCounter = ({
  training: { training_state, error_msg },
}) => {
  return (
    <Group gap="sm">
      {training_state !== "TRAINING_FAILED" &&
        states.map(([k, v], i) => {
          const color =
            training_state === k
              ? "info"
              : i <= states.findIndex((x) => x[0] === training_state)
                ? "success"
                : "secondary";
          return (
            <Group key={k} gap="xs" align="center">
              {training_state === k ? (
                <Loader size="xs" />
              ) : i <= states.findIndex((x) => x[0] === training_state) ? (
                <FontAwesomeIcon style={{ color: BS_SUCCESS }} icon={faCheck} />
              ) : (
                <FontAwesomeIcon
                  style={{ color: BS_SECONDARY }}
                  icon={faHourglass}
                />
              )}{" "}
              <Badge color={color}>{v}</Badge>
            </Group>
          );
        })}
      {training_state === "TRAINING_FAILED" && (
        <Group gap="xs" align="center">
          <FontAwesomeIcon
            style={{ color: BS_FAILURE }}
            icon={faExclamationTriangle}
          />{" "}
          <Badge color="red">Training failed: {error_msg}</Badge>
        </Group>
      )}
    </Group>
  );
};
