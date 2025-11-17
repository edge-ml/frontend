import React from "react";
import { Badge } from "reactstrap";
import {
  hexToForegroundColor,
  isValidColor,
} from "../../services/ColorService";

const LabelBadge = ({ color, children, ...props }) => {
  // if (!isValidColor(color)) {
  //     throw new Error('Invalid color provided: ' + color);
  // }
  return (
    <Badge
      color={hexToForegroundColor(color)}
      style={{ backgroundColor: color, fontSize: "1em" }}
      {...props}
    >
      {children}
    </Badge>
  );
};

export default LabelBadge;
