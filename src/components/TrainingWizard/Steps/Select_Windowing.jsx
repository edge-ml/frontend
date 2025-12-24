import React, { useState } from "react";
import { Select, Text } from "@mantine/core";
import { HyperparameterView } from "../../Hyperparameters/HyperparameterView";
const Select_Windowing = ({
  onBack,
  onNext,
  windowers,
  setSelectedWindower,
  setWindower,
  footer,
}) => {
  const [window_index, set_window_index] = useState(0);

  if (!windowers.length) {
    return;
  }

  const onParameterChanged = ({ parameter_name, state }) => {
    const idx = windowers[window_index].parameters.findIndex(
      (elm) => elm.parameter_name === parameter_name
    );
    windowers[window_index].parameters[idx].value = state;
    setWindower([...windowers]);
    setSelectedWindower(windowers[window_index]);
  };

  return (
    <>
      <Text fw={700} size="lg">
        4. Select Windowing
      </Text>
      <Select
        data={windowers.map((n) => n.name)}
        value={windowers[window_index]?.name ?? null}
        onChange={(value) => {
          const nextIdx = windowers.findIndex((n) => n.name === value);
          if (nextIdx === -1) return;
          set_window_index(nextIdx);
          setSelectedWindower(windowers[nextIdx]);
        }}
        mt="sm"
        size="lg"
      />
      <HyperparameterView
        handleHyperparameterChange={onParameterChanged}
        isAdvanced={false}
        hyperparameters={windowers[window_index].parameters}
      />
    </>
  );
};

Select_Windowing.validate = ({ selectedWindowing }) => {
  if (!selectedWindowing) {
    return "You need to select a windowing";
  }
};

export default Select_Windowing;
