import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, Fragment } from "react";
import { Collapse, Menu, Button, Group } from "@mantine/core";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <Fragment>
      <h3 style={{ fontWeight: 700 }}>3. Select Classifier</h3>
      <Menu>
        <Menu.Target>
          <Button size="lg">{classifier[classififier_index].name}</Button>
        </Menu.Target>
        <Menu.Dropdown>
          {classifier.map((cls, idx) => (
            <Menu.Item
              key={cls.name}
              onClick={() => {
                setSelectedClassifier(classifier[idx]);
                set_classifier_index(idx);
              }}
            >
              {cls.name}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <div>
        <div
          style={{
            width: "100%",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
            Hyperparameters
          </div>
        </div>
        {basicCnt > 0 ? (
          <HyperparameterView
            handleHyperparameterChange={handleHyperparameterChange}
            model={classifier[classififier_index]}
            isAdvanced={false}
            hyperparameters={classifier[classififier_index].parameters}
          />
        ) : (
          <div style={{ marginBottom: "1rem" }}>
            {advancedCnt > 0
              ? "No basic hyperparameters. You can find advanced hyperparameters in the following section."
              : "No hyperparameters"}
          </div>
        )}
        {advancedCnt > 0 ? (
          <Fragment>
            <div>
              <div
                style={{
                  width: "100%",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <Group align="center" gap="xs">
                  <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                    Advanced Hyperparameters
                  </div>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? (
                      <FontAwesomeIcon size="lg" icon={faCaretDown} />
                    ) : (
                      <FontAwesomeIcon size="lg" icon={faCaretRight} />
                    )}
                  </div>
                </Group>
              </div>
            </div>
            <Collapse in={showAdvanced}>
              <HyperparameterView
                handleHyperparameterChange={handleHyperparameterChange}
                hyperparameters={classifier[classififier_index].parameters}
                isAdvanced={true}
              />
            </Collapse>
          </Fragment>
        ) : null}
      </div>
    </Fragment>
  );
};

Wizard_Hyperparameters.validate = ({ selectedClassifier }) => {
  if (!selectedClassifier) {
    return "You need to select a classifier";
  }
};

export default Wizard_Hyperparameters;
