export const generatePlotBands = (labels, selectedLabel, onClickPlotLine) => {
  if (labels === undefined) return [];

  return labels
    .filter((label) => label.start !== undefined && label.end !== undefined)
    .map((label) => {
    const labelId = label.id ?? label._id;
    if (labelId === undefined || labelId === null) {
      return null;
    }
    return {
      id: "band_" + labelId,
      labelId: labelId,
      from: label.start,
      to: label.end,
      zIndex: 2,
      className:
        selectedLabel && selectedLabel.id === labelId
          ? "plotband-selected"
          : "plotband-deselected",
      color: label.color,
      label: {
        text: label.name,
        style: {
          color: label.color,
          fontWeight: "bold",
          cursor: undefined,
        },
        isPlotline: false,
        isSelected: selectedLabel && selectedLabel.id === labelId,
      },
      // events: {
      //   mousedown: (e) =>
      //     (e, 'band_' + label['_id'], label['_id']),
      // },
    };
  })
  .filter(Boolean);
};

export const generatePlotLines = (labels, selectedLabel, onClickPlotLine) => {
  if (!labels) return [];
  var results = [];
  labels.forEach((label) => {
    const labelId = label.id ?? label._id;
    if (label.start === undefined || labelId === undefined || labelId === null) {
      return;
    }
    results.push(
      generatePlotLine(
        label,
        selectedLabel && selectedLabel.id === labelId,
        true,
        onClickPlotLine
      )
    );
    if (label.end !== undefined) {
      results.push(
        generatePlotLine(
          label,
          selectedLabel && selectedLabel.id === labelId,
          false,
          onClickPlotLine
        )
      );
    }
  });

  return results;
};

const generatePlotLine = (label, selected, isLeft, onClickPlotLine) => {
  const labelId = label.id ?? label._id;
  var plotLineId = isLeft ? "pl" + labelId : "pr" + labelId;
  var labelColor = label.color;
  var value = isLeft ? label.start : label.end;
  return {
    id: plotLineId,
    labelId: labelId,
    value: value,
    className: "plotline",
    zIndex: 3,
    // width: isLabelSelected ? 5 : 2,
    width: 5,
    color: labelColor,
    // isActive: isPlotLineCurrentlyDragged,
    // isSelected: isLabelSelected,
    isPlotline: true,
    isLeftPlotline: isLeft,
    cursor: "grab",
    events: {
      mousedown: (e) => onClickPlotLine(e, plotLineId, label.id),
    },
  };
};
