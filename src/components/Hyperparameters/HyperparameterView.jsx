import React from "react";
import NumberHyperparameter from "./NumberHyperparameter";
import SelectionHyperparameter from "./SelectionHyperparameter";
import TextHyperparameter from "./TextHyperparameter";

export const HyperparameterView = ({
  handleHyperparameterChange,
  hyperparameters,
  isAdvanced,
}) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {hyperparameters.length > 0 &&
        hyperparameters
          .filter((h) => h.is_advanced === isAdvanced)
          .map((h) => {
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
            } else if (h.parameter_type === "text") {
              return (
                <div key={h.parameter_name} style={{ flex: "1 1 50%", paddingRight: 0 }}>
                  <TextHyperparameter
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
