export const generatePlotBands = (labels, selectedLabel, onClickPlotLine) => {
  if (labels === undefined) return [];

  return labels.map((label) => {
    return {
      id: "band_" + label["_id"],
      labelId: label["_id"],
      from: label.start,
      to: label.end,
      zIndex: 2,
      className:
        selectedLabel && selectedLabel._id === label["_id"]
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
        isSelected: selectedLabel && selectedLabel._id === label["_id"],
      },
      // events: {
      //   mousedown: (e) =>
      //     (e, 'band_' + label['_id'], label['_id']),
      // },
    };
  });
};

export const generatePlotLines = (labels, selectedLabel, onClickPlotLine) => {
  if (!labels) return [];
  var results = [];
  labels.forEach((label) => {
    results.push(
      generatePlotLine(
        label,
        selectedLabel && selectedLabel._id === label["_id"],
        true,
        onClickPlotLine
      )
    );
    results.push(
      generatePlotLine(
        label,
        selectedLabel && selectedLabel._id === label["_id"],
        false,
        onClickPlotLine
      )
    );
  });

  return results;
};

const generatePlotLine = (label, selected, isLeft, onClickPlotLine) => {
  var plotLineId = isLeft ? "pl" + label._id : "pr" + label._id;
  var labelColor = label.color;
  var value = isLeft ? label.start : label.end;
  return {
    id: plotLineId,
    labelId: label._id,
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
      mousedown: (e) => onClickPlotLine(e, plotLineId, label._id),
    },
  };
};
