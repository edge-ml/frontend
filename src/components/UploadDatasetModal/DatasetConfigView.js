import React from 'react';
import classnames from 'classnames';

import {
  Table,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Button,
} from 'reactstrap';

import {
  updateDataset,
  createDatasets,
} from '../../services/ApiServices/DatasetServices';

export const DatasetConfigView = ({ fileName, file, changeConfig }) => {
  console.log('config', file, fileName);
  const fileConfig = file.config;
  // return (<h1>hello world</h1>)
  return (
    <div className="mb-2">
      {' '}
      {/* TODO: change key to file.id */}
      <Table>
        {' '}
        {/* TODO: change key to file.id */}
        <thead>
          <tr>
            <th colSpan="2" style={{ padding: '0 12px 0 0' }}>
              <InputGroup size="md">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <b>Dataset-name</b>
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  className="font-weight-bold"
                  id={'datasetName' + String(0)}
                  type="text"
                  placeholder="Name"
                  value={fileConfig.name}
                  onChange={(e) =>
                    changeConfig(fileName, {
                      ...fileConfig,
                      name: e.target.value,
                    })
                  }
                />
              </InputGroup>
            </th>
            <th colSpan="2" style={{ textAlign: 'end', paddingRight: '0px' }}>
              <Button
                id="confirmButton"
                color="primary"
                size="md"
                onClick={() => console.log('delete dataset event')}
              >
                Confirm
              </Button>
            </th>
          </tr>
        </thead>
        {fileConfig.error ? (
          <tbody>
            <tr>
              <td colSpan="3" style={{ color: 'red' }}>
                Error: {fileConfig.error}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {fileConfig.timeSeries.map((timeSeries, seriesIndex) => {
              return (
                <tr key={seriesIndex}>
                  <td
                    style={{
                      paddingTop: 0,
                      paddingBottom: 0,
                    }}
                  >
                    <InputGroup size="sm">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>name</InputGroupText>
                      </InputGroupAddon>
                      <Input
                        data-testid="nameInput"
                        type="text"
                        placeholder="Name"
                        value={timeSeries.name}
                        onChange={(e) =>
                          changeConfig(fileName, {
                            ...fileConfig,
                            timeSeries: fileConfig.timeSeries.map((ts) => {
                              if (ts === timeSeries) {
                                return {
                                  ...ts,
                                  name: e.target.value,
                                };
                              }
                              return ts;
                            }),
                          })
                        }
                      />
                    </InputGroup>
                  </td>
                  <td
                    style={{
                      paddingTop: 0,
                      paddingBottom: 0,
                    }}
                  >
                    <InputGroup size="sm">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>Unit</InputGroupText>
                      </InputGroupAddon>
                      <Input
                        data-testid="unitInput"
                        tpye="text"
                        placeholder="Unit"
                        bsSize="sm"
                        value={timeSeries.unit}
                        onChange={
                          (e) =>
                            changeConfig(fileName, {
                              ...fileConfig,
                              timeSeries: fileConfig.timeSeries.map((ts) => {
                                if (ts === timeSeries) {
                                  return {
                                    ...ts,
                                    unit: e.target.value,
                                  };
                                }
                                return ts;
                              }),
                            })
                          // this.onUnitChange(
                          //   e,
                          //   fileIndex,
                          //   seriesIndex
                          // )
                        }
                      />
                    </InputGroup>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      id="deleteButton"
                      color="primary"
                      size="sm"
                      onClick={
                        () => console.log('set all event triggered')
                        // this.onSetAll(fileIndex, seriesIndex)
                      }
                    >
                      Set all
                    </Button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      id="deleteButton"
                      color="danger"
                      size="sm"
                      onClick={
                        () =>
                          changeConfig(fileName, {
                            ...fileConfig,
                            timeSeries: fileConfig.timeSeries.filter(
                              (ts) => ts !== timeSeries
                            ),
                          })
                        // this.onDeleteTimeSeries(
                        //   fileIndex,
                        //   seriesIndex
                        // )
                      }
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </Table>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {fileConfig.labelings.map((labeling, labelingIndex) => {
          return (
            <div
            // key={labeling + labelingIndex}
            // className={classnames('labelInfo', {
            //   labelBorder: labelingIndex !== 0,
            // })}
            >
              <div
                id={'labelName' + labelingIndex}
                className="mx-2"
                style={{ display: 'inline' }}
              >
                {labeling.datasetLabel.name}
              </div>
              <Button
                color="danger"
                size="sm"
                className="mx-2"
                onClick={
                  () => console.log('delete label event triggered')
                  // this.onDeleteLabeling(
                  //   fileIndex,
                  //   labelingIndex
                  // )
                }
              >
                Delete
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
