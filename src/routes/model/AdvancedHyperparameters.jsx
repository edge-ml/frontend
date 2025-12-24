import React from "react";
import { Box, Card, Collapse, Group, Text } from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";

import { HyperparameterView } from "./HyperparameterView";

export const AdvancedHyperparameters = ({
  showAdvanced,
  toggleShowAdvanced,
  model,
  hyperparameters,
  handleHyperparameterChange,
}) => {
  return (
    <Box mb="md" mt="sm" style={{ alignSelf: "stretch" }}>
      <Card shadow="sm">
        <Box
          onClick={toggleShowAdvanced}
          style={{
            cursor: "pointer",
            borderBottom: showAdvanced ? undefined : "none",
          }}
          p="sm"
        >
          <Group align="flex-start" gap="xs">
            {showAdvanced ? (
              <FontAwesomeIcon icon={faCaretDown} />
            ) : (
              <FontAwesomeIcon icon={faCaretRight} />
            )}
            <Text fw={500}>Advanced Hyperparameters</Text>
          </Group>
        </Box>
        <Collapse in={showAdvanced}>
          <Box p="sm">
            <HyperparameterView
              model={model}
              hyperparameters={hyperparameters}
              handleHyperparameterChange={handleHyperparameterChange}
              isAdvanced={true}
            />
          </Box>
        </Collapse>
      </Card>
    </Box>
  );
};
