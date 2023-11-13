import React from 'react';

export const ConfusionMatrixView = ({ matrix, labels }) => {
  var cm = matrix;

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
    <div className="ml-5">
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
                transform: 'translateY(-50%) rotate(-75deg)',
                maxWidth: '50px',
              }}
            >
              {label}
            </td>
          ))}
        </tr>
        {cm.map((row, rowIdx) => (
          <tr>
            <td
              className="pr-2"
              style={{
                textAlign: 'end',
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
