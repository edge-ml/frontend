import React from 'react';
import { validationSelectOptions } from '../../routes/model/ValidationMethodsView';

const meanMedian = (arr) => {
  const sum = arr.reduce((sum, val) => (sum += val));
  const len = arr.length;

  const arrSort = arr.sort();
  const mid = Math.ceil(len / 2);

  const median =
    len % 2 == 0 ? (arrSort[mid] + arrSort[mid - 1]) / 2 : arrSort[mid - 1];

  return [sum / len, median];
};

export const CrossValidationTable = (props) => {
  const { method, loso_variable, results } = props;

  switch (method) {
    case validationSelectOptions.LOSO.value:
      return (
        <React.Fragment>
          <div>
            <strong>Method: </strong>
            <span>{validationSelectOptions.LOSO.label}</span>
          </div>
          <div>
            <strong>LOSO Metadata Variable: </strong>
            <code>{loso_variable}</code>
          </div>
          {Object.entries(results).map(([k, v]) => (
            <div key={k}>
              <strong>{k}: </strong>
              <table>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.15rem .75rem' }}>mean: </td>
                    <td style={{ padding: '0.15rem .75rem' }}>
                      {meanMedian(v)[0].toFixed(8)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.15rem .75rem' }}>median: </td>
                    <td style={{ padding: '0.15rem .75rem' }}>
                      {meanMedian(v)[1].toFixed(8)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </React.Fragment>
      );
    default:
      return <pre>{JSON.stringify(props, undefined, 2)}</pre>;
  }
};
