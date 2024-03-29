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

export const DatasetConfigView = ({ fileId, fileConfig, changeConfig, confirmConfig, backendId }) => {
  const onDeleteLabeling = (labelingToDeleteOriginalName) => {
    changeConfig(fileId, {
      ...fileConfig, 
      labelings: fileConfig.labelings
                            .map(l => l.originalName !== labelingToDeleteOriginalName ? l : { ...l, removed: true })
    })
  }

  const onCloseConfig = () => {
    changeConfig(fileId, {
      ...fileConfig,
      editingModeActive: false,
    })
  }

  const onSetAllUnits = (unit) => {
    changeConfig(fileId, {
      ...fileConfig,
      timeSeries: fileConfig.timeSeries.map(ts => ({ ...ts, unit: unit }))
    })
  }

  return (
    <div className="mb-2 mt-2">
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
                    changeConfig(fileId, {
                      ...fileConfig,
                      name: e.target.value,
                    })
                  }
                />
              </InputGroup>
            </th>
            <th colSpan="2" style={{ textAlign: 'end', paddingRight: '0px' }}>
              <div className='d-flex justify-content-end'>
                <Button
                  id="confirmButton"
                  color="primary"
                  size="md"
                  onClick={() => {
                    changeConfig(fileId, {
                      ...fileConfig,
                      editingModeActive: false,
                    })
                    onCloseConfig();
                  }}
                >
                  Confirm
                </Button>
              </div>
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
              if (timeSeries.removed) return null;
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
                          changeConfig(fileId, {
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
                            changeConfig(fileId, {
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
                        }
                      />
                    </InputGroup>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      id="setAllButton"
                      color="primary"
                      size="sm"
                      onClick={() => onSetAllUnits(fileConfig.timeSeries[seriesIndex].unit)}
                    >
                      Set all
                    </Button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      id="deleteButton"
                      color="danger"
                      size="sm"
                      disabled={fileConfig.timeSeries.length === 1}
                      onClick={
                        () =>
                          changeConfig(fileId, {
                            ...fileConfig,
                            timeSeries: fileConfig.timeSeries.map(ts => ts !== timeSeries ? ts : {...ts, removed: true}),
                          })
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
          if (labeling.removed) return null;
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
                {labeling.name}
              </div>
              <Button
                color="danger"
                size="sm"
                className="mx-2"
                onClick={() => onDeleteLabeling(labeling.originalName)}
              >
                Delete
              </Button>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};
