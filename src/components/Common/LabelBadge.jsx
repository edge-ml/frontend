import React from "react";
import { Badge } from "@mantine/core";
import { hexToForegroundColor } from "../../services/ColorService";

const LabelBadge = ({ color, children, style, ...props }) => {
  const mergedStyle = {
    backgroundColor: color,
    color: hexToForegroundColor(color),
    border: "1px solid #000",
    ...style,
  };
  return (
    <Badge
      color="gray"
      style={mergedStyle}
      size="md"
      radius="sm"
      {...props}
    >
      {children}
    </Badge>
  );
};

export default LabelBadge;
