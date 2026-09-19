import React from "react";
import { Collapse, Card } from "@mantine/core";

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
    <div
      style={{
        marginBottom: "1rem",
        marginTop: "0.5rem",
        alignSelf: "stretch",
      }}
    >
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Card.Section
          style={{
            cursor: "pointer",
            padding: "0.75rem 1rem",
            textAlign: "left",
          }}
          onClick={toggleShowAdvanced}
        >
          {showAdvanced ? (
            <FontAwesomeIcon icon={faCaretDown} />
          ) : (
            <FontAwesomeIcon icon={faCaretRight} />
          )}
          <span style={{ fontWeight: 500 }}> Advanced Hyperparameters</span>
        </Card.Section>
        <Collapse in={showAdvanced}>
          <div style={{ padding: "1rem" }}>
            <HyperparameterView
              model={model}
              hyperparameters={hyperparameters}
              handleHyperparameterChange={handleHyperparameterChange}
              isAdvanced={true}
            />
          </div>
        </Collapse>
      </Card>
    </div>
  );
};
