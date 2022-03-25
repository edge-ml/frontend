import React, { useEffect, useState, useMemo } from 'react';

const ConfusionMatrixRow = ({
  labels,
  actualLabel,
  maxVal,
  confusionMatrix
}) => {
  return labels.map((e, predicted) => {
    const value = confusionMatrix[actualLabel][predicted];
    return (
      <td
        key={predicted}
        className="ConfusionMatrixCell"
        // style={{ background: heatMapColorforValue(value / maxVal) }}
      >
        {value && value}
      </td>
    );
  });
};

const heatMapColorforValue = value => {
  var h = (1.0 - value) * 240;
  return 'hsl(' + h + ', 100%, 50%)';
};

export const ConfusionMatrixView = ({ matrix, labelMap, labelIds }) => {
  const [confusionMatrix, setConfusionMatrix] = useState([]);
  const [labels, setLabels] = useState([]);
  const [maxVal, setMaxVal] = useState(0);

  useEffect(() => {
    const cm = matrix.split('\n').map(r =>
      r
        .replace(/\[|\]/g, '')
        .trim()
        .split(/\s+/)
        .map(v => parseInt(v))
    );
    if (!labelIds.length) {
      setLabels([...Array(cm[0].length).keys()]);
    } else {
      setLabels(
        labelIds.map(id => labelMap.filter(label => label._id === id)[0].name)
      );
    }
    setConfusionMatrix(cm);
    const rowMax = cm.map(r => Math.max.apply(Math, r));
    setMaxVal(Math.max.apply(Math, rowMax));
  }, []);

  const confusionMatrixTable = useMemo(() => {
    let cmTableHeader = labels.map(key => (
      <td key={key}>
        <div>
          <span>{key}</span>
        </div>
      </td>
    ));
    return (
      <table className="ConfusionMatrix">
        <thead className="ConfusionMatrixHeader">
          <tr>
            <td></td>
            {cmTableHeader}
          </tr>
        </thead>
        <tbody>
          {labels.map((key, idx) => {
            return (
              <tr key={key} className="ConfusionMatrixRow">
                <td className="ConfusionMatrixLabel">{key}</td>
                <ConfusionMatrixRow
                  actualLabel={idx}
                  labels={labels}
                  maxVal={maxVal}
                  confusionMatrix={confusionMatrix}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }, [confusionMatrix, labels]);

  return confusionMatrixTable;
};

export default ConfusionMatrixView;
