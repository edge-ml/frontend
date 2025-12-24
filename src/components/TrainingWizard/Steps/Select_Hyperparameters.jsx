import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Collapse, Group, Select, Text, Title } from "@mantine/core";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";

import { HyperparameterView } from "../../Hyperparameters/HyperparameterView";

const Wizard_Hyperparameters = ({
  classifier,
  onBack,
  onNext,
  onTrain,
  setSelectedClassifier,
  setClassifier,
  footer,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [classififier_index, set_classifier_index] = useState(0);

  const handleHyperparameterChange = ({ parameter_name, value }) => {
    const newClassifier = [...classifier];
    const idx = newClassifier[classififier_index].parameters.findIndex(
      (elm) => elm.parameter_name === parameter_name
    );
    newClassifier[classififier_index].parameters[idx].value = value;
    setClassifier(newClassifier);
    setSelectedClassifier(newClassifier[classififier_index]);
  };

  if (classifier.length === 0) {
    return null;
  }

  const advancedCnt = classifier[classififier_index].parameters.filter(
    (p) => p.is_advanced
  ).length;
  const basicCnt = classifier[classififier_index].parameters.filter(
    (p) => !p.is_advanced
  ).length;

  return (
    <>
      <Title order={3}>3. Select Classifier</Title>
      <Select
        data={classifier.map((cls) => cls.name)}
        value={classifier[classififier_index]?.name ?? null}
        onChange={(value) => {
          const nextIdx = classifier.findIndex((cls) => cls.name === value);
          if (nextIdx === -1) return;
          setSelectedClassifier(classifier[nextIdx]);
          set_classifier_index(nextIdx);
        }}
        mt="sm"
        size="lg"
      />
      <Box>
        <Text fw={700} size="lg" mt="sm">
          Hyperparameters
        </Text>
        {basicCnt > 0 ? (
          <HyperparameterView
            handleHyperparameterChange={handleHyperparameterChange}
            model={classifier[classififier_index]}
            isAdvanced={false}
            hyperparameters={classifier[classififier_index].parameters}
          />
        ) : (
          <Text mt="sm">
            {advancedCnt > 0
              ? "No basic hyperparameters. You can find advanced hyperparameters in the following section."
              : "No hyperparameters"}
          </Text>
        )}
        {advancedCnt > 0 ? (
          <>
            <Group align="center" gap="xs" mt="sm">
              <Text fw={700} size="lg">
                Advanced Hyperparameters
              </Text>
              <Box
                className="buttonShowAdvancedHyperparameters"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{ cursor: "pointer" }}
              >
                {showAdvanced ? (
                  <FontAwesomeIcon
                    className="faIconAdvancedHyperparameters"
                    size="lg"
                    icon={faCaretDown}
                  />
                ) : (
                  <FontAwesomeIcon
                    className="faIconAdvancedHyperparameters"
                    size="lg"
                    icon={faCaretRight}
                  />
                )}
              </Box>
            </Group>
            <Collapse in={showAdvanced}>
              <HyperparameterView
                handleHyperparameterChange={handleHyperparameterChange}
                hyperparameters={classifier[classififier_index].parameters}
                isAdvanced={true}
              />
            </Collapse>
          </>
        ) : null}
      </Box>
    </>
  );
};

Wizard_Hyperparameters.validate = ({ selectedClassifier }) => {
  if (!selectedClassifier) {
    return "You need to select a classifier";
  }
};

export default Wizard_Hyperparameters;
