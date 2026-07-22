import React from "react";

import Loader from "../../modules/loader";

import NumberHyperparameter from "../../components/Hyperparameters/NumberHyperparameter";
import SelectionHyperparameter from "../../components/Hyperparameters/SelectionHyperparameter";

export const HyperparameterView = ({
  model,
  hyperparameters,
  handleHyperparameterChange,
  isAdvanced,
}) => {
  return (
    <Loader loading={!model}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {model &&
          Object.keys(model.hyperparameters)
            .filter((h) => model.hyperparameters[h].is_advanced == isAdvanced)
            .map((h) => {
              if (model.hyperparameters[h].parameter_type === "number") {
                return (
                  <div key={h} style={{ flex: "1 1 33.33%", paddingRight: 0 }}>
                    <NumberHyperparameter
                      {...model.hyperparameters[h]}
                      id={"input_" + model.hyperparameters[h].parameter_name}
                      handleChange={handleHyperparameterChange}
                      value={
                        hyperparameters.find(
                          (e) =>
                            e.parameter_name ===
                            model.hyperparameters[h].parameter_name
                        ).state
                      }
                    />
                  </div>
                );
              } else if (
                model.hyperparameters[h].parameter_type === "selection"
              ) {
                return (
                  <div key={h} style={{ flex: "1 1 33.33%", paddingRight: 0 }}>
                    <SelectionHyperparameter
                      {...model.hyperparameters[h]}
                      id={"input_" + model.hyperparameters[h].parameter_name}
                      handleChange={handleHyperparameterChange}
                      value={
                        hyperparameters.find(
                          (e) =>
                            e.parameter_name ===
                            model.hyperparameters[h].parameter_name
                        ).state
                      }
                    />
                  </div>
                );
              }
            })}
      </div>
    </Loader>
  );
};
