import React from "react";
import { TextInput, Button } from "@mantine/core";

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
    <div
      style={{
        marginBottom: "0.75rem",
        marginTop: "0.5rem",
        border: "1px solid rgb(230, 230, 234)",
        borderRadius: "10px",
        padding: "1rem",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th colSpan="2" style={{ padding: "0 12px 0 0" }}>
              <TextInput
                label={<b>Dataset-name</b>}
                id={"datasetName" + String(0)}
                placeholder="Name"
                value={fileConfig.name}
                onChange={(e) =>
                  changeConfig(fileId, {
                    ...fileConfig,
                    name: e.target.value,
                  })
                }
                style={{ maxWidth: "350px" }}
              />
            </th>
            <th colSpan="4" style={{ textAlign: "end", paddingRight: "0px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  id="confirmButton"
                  color="green"
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
              </div>
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
            {fileConfig.timeSeries.map((timeSeries, seriesIndex) => {
              if (timeSeries.removed) return null;
              return (
                <tr key={seriesIndex}>
                  <td
                    style={{
                      paddingTop: 0,
                      paddingBottom: 0,
                      width: "40%",
                    }}
                  >
                    <TextInput
                      label="Name"
                      data-testid="nameInput"
                      placeholder="Name"
                      size="sm"
                      value={timeSeries.name}
                      onChange={(e) =>
                        changeConfig(fileId, {
                          ...fileConfig,
                          timeSeries: fileConfig.timeSeries.map((ts) => {
                            if (ts === timeSeries) {
                              return { ...ts, name: e.target.value };
                            }
                            return ts;
                          }),
                        })
                      }
                    />
                  </td>
                  <td
                    style={{
                      paddingTop: 0,
                      paddingBottom: 0,
                      width: "15%",
                    }}
                  >
                    <TextInput
                      label="Unit"
                      data-testid="unitInput"
                      placeholder="Unit"
                      size="sm"
                      value={timeSeries.unit}
                      onChange={(e) =>
                        changeConfig(fileId, {
                          ...fileConfig,
                          timeSeries: fileConfig.timeSeries.map((ts) => {
                            if (ts === timeSeries) {
                              return { ...ts, unit: e.target.value };
                            }
                            return ts;
                          }),
                        })
                      }
                    />
                  </td>
                  <td
                    style={{
                      paddingTop: 0,
                      paddingBottom: 0,
                      width: "15%",
                    }}
                  >
                    <TextInput
                      label="Scale"
                      data-testid="scaleInput"
                      size="sm"
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
                    />
                  </td>
                  <td
                    style={{
                      paddingTop: 0,
                      paddingBottom: 0,
                      width: "15%",
                    }}
                  >
                    <TextInput
                      label="Offset"
                      data-testid="offsetInput"
                      size="sm"
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
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Button
                      id="setAllButton"
                      color="green"
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
      </table>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "0.5rem",
        }}
      >
        {fileConfig.labelings.map((labeling, labelingIndex) => {
          if (labeling.removed) return null;
          return (
            <div key={labeling.originalName}>
              <span
                id={"labelName" + labelingIndex}
                style={{
                  marginRight: "0.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#5C5F66",
                }}
              >
                {labeling.name}
              </span>
              <Button
                color="red"
                size="xs"
                onClick={() => onDeleteLabeling(labeling.originalName)}
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
