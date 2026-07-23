import React from "react";
import { Badge } from "@mantine/core";

const LabelBadge = ({ color, children, ...props }) => {
  return (
    <Badge color={color} variant="light" {...props}>
      {children}
    </Badge>
  );
};

export default LabelBadge;
