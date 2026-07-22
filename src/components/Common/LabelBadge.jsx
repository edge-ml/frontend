import React from "react";
import { hexToForegroundColor, isValidColor } from "../../services/ColorService";

const LabelBadge = ({ color, children, ...props }) => {
  const textColor = hexToForegroundColor(color) === "dark" ? "#fff" : "#000";
  return (
    <span
      style={{
        backgroundColor: color,
        color: textColor,
        fontSize: "1em",
        padding: "2px 8px",
        borderRadius: "4px",
        display: "inline-block",
        fontWeight: 700,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export default LabelBadge;
