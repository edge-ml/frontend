import React, { useState, Fragment } from "react";
import { Menu, Button } from "@mantine/core";
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
    return null;
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
    <Fragment>
      <h3 style={{ fontWeight: 700 }}>4. Select Windowing</h3>
      <Menu>
        <Menu.Target>
          <Button size="lg">
            {windowers[window_index].name}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {windowers.map((n, idx) => (
            <Menu.Item
              key={n.name}
              onClick={() => {
                set_window_index(idx);
                setSelectedWindower(windowers[idx]);
              }}
            >
              {n.name}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <HyperparameterView
        handleHyperparameterChange={onParameterChanged}
        isAdvanced={false}
        hyperparameters={windowers[window_index].parameters}
      />
    </Fragment>
  );
};

Select_Windowing.validate = ({ selectedWindowing }) => {
  if (!selectedWindowing) {
    return "You need to select a windowing";
  }
};

export default Select_Windowing;
