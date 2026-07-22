import React from "react";
import { useState, Fragment } from "react";
import { Menu, Button } from "@mantine/core";
import NumberHyperparameter from "../../Hyperparameters/NumberHyperparameter";
import SelectionHyperparameter from "../../Hyperparameters/SelectionHyperparameter";

const SelectEvaluation = ({
  evaluation,
  onEvaluationChanged,
  setSelectedEval,
  footer,
}) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState(0);

  const handleHyperparameterChange = ({ parameter_name, state }) => {
    const newEval = [...evaluation];
    const idx = newEval[selectedEvaluation].parameters.findIndex(
      (elm) => elm.parameter_name == parameter_name
    );
    newEval[selectedEvaluation].parameters[idx].value = state;
    onEvaluationChanged(newEval);
    setSelectedEval(newEval[selectedEvaluation]);
  };

  if (evaluation.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <h3 style={{ fontWeight: 700 }}>7. Select Evaluation Strategy</h3>
      <Menu>
        <Menu.Target>
          <Button size="lg">
            {evaluation[selectedEvaluation].name}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {evaluation.map((evl, idx) => (
            <Menu.Item key={evl.name} onClick={() => setSelectedEvaluation(idx)}>
              {evl.name}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      {evaluation[0] ? (
        <HyperparameterView
          handleHyperparameterChange={handleHyperparameterChange}
          hyperparameters={evaluation[selectedEvaluation].parameters}
        />
      ) : null}
    </Fragment>
  );
};

export const HyperparameterView = ({
  handleHyperparameterChange,
  hyperparameters,
}) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {hyperparameters.length > 0 &&
        hyperparameters.map((h) => {
          if (h.parameter_type === "number") {
            return (
              <div key={h.parameter_name} style={{ flex: "1 1 50%", paddingRight: 0 }}>
                <NumberHyperparameter
                  {...h}
                  id={"input_" + h.parameter_name}
                  handleChange={handleHyperparameterChange}
                  value={h.value}
                />
              </div>
            );
          } else if (h.parameter_type === "selection") {
            return (
              <div key={h.parameter_name} style={{ flex: "1 1 50%", paddingRight: 0 }}>
                <SelectionHyperparameter
                  {...h}
                  id={"input_" + h.parameter_name}
                  handleChange={handleHyperparameterChange}
                  value={h.value}
                />
              </div>
            );
          }
        })}
    </div>
  );
};

SelectEvaluation.validate = () => {};

export default SelectEvaluation;
