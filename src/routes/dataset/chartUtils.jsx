export const generatePlotBands = (
  labels,
  selectedLabelId,
  mouseDownHandler,
) => {
  
  if (labels === undefined) return [];



  return labels.map((label) => {
    return {
      id: 'band_' + label['_id'],
      labelId: label['_id'],
      from: label.start,
      to: label.end,
      zIndex: 2,
      className:
        selectedLabelId === label['_id']
          ? 'plotband-selected'
          : 'plotband-deselected',
      color: label.color,
      label: {
        text: label.name,
        style: {
          color: label.color,
          fontWeight: 'bold',
          cursor: undefined,
        },
        isPlotline: false,
        isSelected: selectedLabelId === label['_id'],
      },
      events: {
        mousedown: (e) =>
          mouseDownHandler(e, 'band_' + label['_id'], label['_id']),
      },
    };
  });
};

export const generatePlotLines = (labels, selectedLabelId) => {
  if (!labels) return [];
  var results = [];
  labels.forEach((label) => {
    results.push(
      generatePlotLine(label, selectedLabelId === label['_id'], true),
    );
    results.push(
      generatePlotLine(label, selectedLabelId === label['_id'], false),
    );
  });

  return results;
};

const generatePlotLine = (label, selected, isLeft, mouseDownHandler) => {
  var plotLineId = isLeft ? 'pl' + label._id : 'pr' + label._id;

  var labelColor = label.color;
  var value = isLeft ? label.start : label.end;
  return {
    id: plotLineId,
    labelId: label._id,
    value: value,
    className: 'plotline-deselected',
    zIndex: 3,
    // width: isLabelSelected ? 5 : 2,
    width: 5,
    color: labelColor,
    // isActive: isPlotLineCurrentlyDragged,
    // isSelected: isLabelSelected,
    isPlotline: true,
    isLeftPlotline: isLeft,
    events: {
      mousedown: (e) => mouseDownHandler(e, plotLineId, label._id),
    },
  };
};
