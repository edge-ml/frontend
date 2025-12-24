import React from "react";

import { Button, Group, Table, Text, TextInput } from "@mantine/core";

export const DatasetConfigView = ({ fileId, fileConfig, changeConfig }) => {
  const onDeleteLabeling = (labelingToDeleteOriginalName) => {
    changeConfig(fileId, {
      ...fileConfig,
      labelings: fileConfig.labelings.map((l) =>
        l.originalName !== labelingToDeleteOriginalName
          ? l
          : { ...l, removed: true }
      ),
    });
  };

  const onCloseConfig = () => {
    changeConfig(fileId, {
      ...fileConfig,
      editingModeActive: false,
    });
  };

  const onSetAllUnits = ({ unit, scale, offset }) => {
    changeConfig(fileId, {
      ...fileConfig,
      timeSeries: fileConfig.timeSeries.map((ts) => ({
        ...ts,
        unit: unit,
        scale: scale,
        offset: offset,
      })),
    });
  };

  const isNumeric = (value) => {
    return /^[0-9]+$/.test(value);
  };

  return (
    <div className="mb-2 mt-2">
      <Table>
        <thead>
          <tr>
            <th colSpan="2">
              <Group gap="sm" align="center">
                <Text fw={600}>Dataset name</Text>
                <TextInput
                  className="fw-bold"
                  id={"datasetName" + String(0)}
                  label="Name"
                  placeholder="Name"
                  value={fileConfig.name}
                  onChange={(e) =>
                    changeConfig(fileId, {
                      ...fileConfig,
                      name: e.target.value,
                    })
                  }
                />
              </Group>
            </th>
            <th colSpan="4">
              <Group justify="flex-end">
                <Button
                  id="confirmButton"
                  color="blue"
                  size="xs"
                  onClick={() => {
                    changeConfig(fileId, {
                      ...fileConfig,
                      editingModeActive: false,
                    });
                    onCloseConfig();
                  }}
                >
                  Confirm
                </Button>
              </Group>
            </th>
          </tr>
        </thead>
        {fileConfig.error ? (
          <tbody>
            <tr>
              <td colSpan="3" style={{ color: "red" }}>
                Error: {fileConfig.error}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan="6">
                <hr />
              </td>
            </tr>
            {fileConfig.timeSeries.map((timeSeries, seriesIndex) => {
              if (timeSeries.removed) return null;
              return (
                <tr key={seriesIndex}>
                  <td style={{ width: "40%" }}>
                    <TextInput
                      data-testid="nameInput"
                      label="Time series name"
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
                      size="xs"
                    />
                  </td>
                  <td style={{ width: "15%" }}>
                    <TextInput
                      data-testid="unitInput"
                      label="Unit"
                      placeholder="Unit"
                      value={timeSeries.unit}
                      onChange={(e) =>
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
                      size="xs"
                    />
                  </td>
                  <td style={{ width: "15%" }}>
                    <TextInput
                      data-testid="scaleInput"
                      label="Scale"
                      placeholder="1"
                      value={timeSeries.scale}
                      onChange={(e) => {
                        if (e.target.value !== "" && !isNumeric(e.target.value))
                          return;
                        changeConfig(fileId, {
                          ...fileConfig,
                          timeSeries: fileConfig.timeSeries.map((ts) => {
                            if (ts === timeSeries) {
                              return {
                                ...ts,
                                scale:
                                  e.target.value === "" ? 1 : e.target.value,
                              };
                            }
                            return ts;
                          }),
                        });
                      }}
                      size="xs"
                    />
                  </td>
                  <td style={{ width: "15%" }}>
                    <TextInput
                      data-testid="offsetInput"
                      label="Offset"
                      placeholder="0"
                      value={timeSeries.offset}
                      onChange={(e) => {
                        if (e.target.value !== "" && !isNumeric(e.target.value))
                          return;
                        changeConfig(fileId, {
                          ...fileConfig,
                          timeSeries: fileConfig.timeSeries.map((ts) => {
                            if (ts === timeSeries) {
                              return {
                                ...ts,
                                offset:
                                  e.target.value === "" ? 0 : e.target.value,
                              };
                            }
                            return ts;
                          }),
                        });
                      }}
                      size="xs"
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Button
                      id="setAllButton"
                      color="blue"
                      size="xs"
                      onClick={() =>
                        onSetAllUnits(fileConfig.timeSeries[seriesIndex])
                      }
                    >
                      Set all
                    </Button>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Button
                      id="deleteButton"
                      color="red"
                      size="xs"
                      disabled={fileConfig.timeSeries.length === 1}
                      onClick={() =>
                        changeConfig(fileId, {
                          ...fileConfig,
                          timeSeries: fileConfig.timeSeries.map((ts) =>
                            ts !== timeSeries ? ts : { ...ts, removed: true }
                          ),
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
      <Group justify="center" gap="xs">
        {fileConfig.labelings.map((labeling, labelingIndex) => {
          if (labeling.removed) return null;
          return (
            <Group key={labelingIndex} gap="xs">
              <Text id={"labelName" + labelingIndex} size="sm">
                {labeling.name}
              </Text>
              <Button
                color="red"
                size="xs"
                onClick={() => onDeleteLabeling(labeling.originalName)}
              >
                Delete
              </Button>
            </Group>
          );
        })}
      </Group>
      <hr />
    </div>
  );
};
