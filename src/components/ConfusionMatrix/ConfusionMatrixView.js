import React from 'react';

export const ConfusionMatrixView = ({ matrix, labelMap, labelIds }) => {
  var cm = matrix.split('\n').map((r) =>
    r
      .replace(/\[|\]/g, '')
      .trim()
      .split(/\s+/)
      .map((v) => parseInt(v))
  );

  var labels = undefined;
  if (!labelIds.length) {
    labels = [...Array(cm[0].length).keys()];
  } else {
    labels = labelIds.map(
      (id) => labelMap.filter((label) => label._id === id)[0].name
    );
  }

  const maxValue = Math.max(...cm.flat());
  const cmLen = cm.length;

  const getAdditionalStyles = (col) => {
    const scale = (parseFloat(col) / parseFloat(maxValue)) * 70;
    return {
      backgroundColor: 'hsl(202, 100%,' + (100 - scale) + '%)',
      color: scale > 50 ? 'white' : 'black',
    };
  };

  return (
    <div>
      <table>
        <tr>
          <td></td>
          {labels.map((label) => (
            <td
              style={{
                paddingRight: 0,
                paddingLeft: 0,
                textAlign: 'center',
                borderBottom: '1px solid black',
                fontWeight: 'bold',
              }}
            >
              {label}
            </td>
          ))}
        </tr>
        {cm.map((row, rowIdx) => (
          <tr>
            <td
              style={{
                borderRight: '1px solid black',
                paddingBottom: '2px',
                fontWeight: 'bold',
              }}
            >
              {labels[rowIdx]}
            </td>
            {row.map((col, colIdx) => (
              <td
                style={{
                  padding: 0,
                  height: '50px',
                  width: '50px',
                  borderRight: colIdx == cmLen - 1 ? '1px solid black' : null,
                  borderBottom: rowIdx == cmLen - 1 ? '1px solid black' : null,
                  ...getAdditionalStyles(col),
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'inherit',
                  }}
                >
                  {col}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  );
};

export default ConfusionMatrixView;
