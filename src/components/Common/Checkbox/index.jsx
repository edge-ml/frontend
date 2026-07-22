import React from "react";
import { Checkbox as MantineCheckbox } from "@mantine/core";

const Checkbox = ({ isSelected, onClick, disabled, ...props }) => {
  return (
    <MantineCheckbox
      checked={isSelected}
      onChange={onClick}
      disabled={disabled}
      {...props}
    />
  );
};

export default Checkbox;
