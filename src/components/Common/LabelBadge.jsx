import React from "react";
import { Badge } from "@mantine/core";
import { hexToForegroundColor } from "../../services/ColorService";

const LabelBadge = ({ color, children, ...props }) => {
  return (
    <Badge
      color="gray"
      style={{ backgroundColor: color, color: hexToForegroundColor(color) }}
      size="md"
      radius="sm"
      {...props}
    >
      {children}
    </Badge>
  );
};

export default LabelBadge;
