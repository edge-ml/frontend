import React from "react";
import { SimpleGrid } from "@mantine/core";
import NumberHyperparameter from "./NumberHyperparameter";
import SelectionHyperparameter from "./SelectionHyperparameter";
import TextHyperparameter from "./TextHyperparameter";

export const HyperparameterView = ({
  handleHyperparameterChange,
  hyperparameters,
  isAdvanced,
}) => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      {hyperparameters.length > 0 &&
        hyperparameters
          .filter((h) => h.is_advanced === isAdvanced)
          .map((h) => {
            if (h.parameter_type === "number") {
              return (
                <div key={h.parameter_name}>
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
                <div key={h.parameter_name}>
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
                <div key={h.parameter_name}>
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
    </SimpleGrid>
  );
};
