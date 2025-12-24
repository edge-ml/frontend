import React from "react";
import { Box, SimpleGrid } from "@mantine/core";
import NumberHyperparameter from "./NumberHyperparameter";
import SelectionHyperparameter from "./SelectionHyperparameter";
import TextHyperparameter from "./TextHyperparameter";

export const HyperparameterView = ({
  handleHyperparameterChange,
  hyperparameters,
  isAdvanced,
}) => {
  return (
    <Box>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {hyperparameters.length > 0 &&
          hyperparameters
            .filter((h) => h.is_advanced === isAdvanced)
            .map((h) => {
              if (h.parameter_type === "number") {
                return (
                  <NumberHyperparameter
                    key={h.parameter_name}
                    {...h}
                    id={"input_" + h.parameter_name}
                    handleChange={handleHyperparameterChange}
                    value={h.value}
                  />
                );
              } else if (h.parameter_type === "selection") {
                return (
                  <SelectionHyperparameter
                    key={h.parameter_name}
                    {...h}
                    id={"input_" + h.parameter_name}
                    handleChange={handleHyperparameterChange}
                    value={h.value}
                  />
                );
              } else if (h.parameter_type === "text") {
                return (
                  <TextHyperparameter
                    key={h.parameter_name}
                    {...h}
                    id={"input_" + h.parameter_name}
                    handleChange={handleHyperparameterChange}
                    value={h.value}
                  />
                );
              }
              return null;
            })}
      </SimpleGrid>
    </Box>
  );
};
