import React from "react";
import { Group, Text, Tooltip } from "@mantine/core";

import "./ConfusionMatrix.css";

// Truncate long labels for the header cells; the full name stays in the tooltip.
const short = (s, n = 16) =>
  s && s.length > n ? s.slice(0, n - 1) + "…" : s;

export const ConfusionMatrixView = ({ matrix, labels, colorMap = {} }) => {
  const cm = matrix || [];
  const n = cm.length;
  const maxValue = Math.max(1, ...cm.flat());

  // Cells shrink as the label count grows so a big matrix stays readable
  // without forcing the whole modal to scroll.
  const cell = n <= 6 ? 46 : n <= 12 ? 38 : n <= 20 ? 30 : 24;
  const font = n <= 12 ? 13 : n <= 20 ? 11 : 10;

  const cellStyle = (value) => {
    const scale = (parseFloat(value) / parseFloat(maxValue)) * 70;
    return {
      backgroundColor: `hsl(202, 100%, ${100 - scale}%)`,
      color: scale > 45 ? "#fff" : "#1a1b1e",
    };
  };

  return (
    <div className="cm">
      <Text size="xs" c="dimmed" mb={6}>
        Rows are the true label, columns the predicted label. The diagonal (boxed)
        is correct predictions.
      </Text>

      <div className="cm-scroll">
        <table className="cm-table" style={{ fontSize: font }}>
          <thead>
            <tr>
              <th className="cm-corner" />
              {labels.map((label) => (
                <th key={label} className="cm-col-head" style={{ width: cell }}>
                  <Tooltip label={label} withArrow disabled={label.length <= 16}>
                    <span className="cm-col-head-text">{short(label)}</span>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cm.map((row, r) => (
              <tr key={labels[r] ?? r}>
                <th className="cm-row-head">
                  <Tooltip
                    label={labels[r]}
                    withArrow
                    disabled={(labels[r] || "").length <= 18}
                  >
                    <span className="cm-row-head-text">
                      <span
                        className="cm-dot"
                        style={{ background: colorMap[labels[r]] || "#adb5bd" }}
                      />
                      {short(labels[r], 18)}
                    </span>
                  </Tooltip>
                </th>
                {row.map((value, c) => (
                  <td
                    key={c}
                    className={`cm-cell${r === c ? " cm-diag" : ""}`}
                    style={{ width: cell, height: cell, ...cellStyle(value) }}
                  >
                    <Tooltip
                      withArrow
                      label={`True ${labels[r]} · predicted ${labels[c]}: ${value}`}
                    >
                      <span className="cm-cell-val">{value}</span>
                    </Tooltip>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Group gap={8} mt="sm" align="center">
        <Text size="xs" c="dimmed">
          0
        </Text>
        <div className="cm-legend" />
        <Text size="xs" c="dimmed">
          {maxValue}
        </Text>
        <Text size="xs" c="dimmed" ml={4}>
          samples
        </Text>
      </Group>
    </div>
  );
};

export default ConfusionMatrixView;
