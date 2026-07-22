import React from "react";

import { Card, Text } from "@mantine/core";

import Loader from "../../modules/loader";

export const TargetSensorsView = ({
  sensorStreams,
  selectedSensorStreams,
  toggleSelectedSensorStreams,
  changeAllSelectedSensorStreams,
}) => {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: "left" }}>
      <Card.Section>
        <Text fw={700} size="lg" p="md"><h4>Target Sensor Streams</h4></Text>
      </Card.Section>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", padding: "1rem" }}>
        <Loader loading={!sensorStreams}>
          {sensorStreams && sensorStreams.length > 0 && (
            <fieldset>
              <input
                id="select-all"
                type="checkbox"
                onClick={(y) => {
                  changeAllSelectedSensorStreams(
                    !sensorStreams ||
                      !sensorStreams.every((x) =>
                        selectedSensorStreams.includes(x)
                      )
                  );
                }}
                checked={
                  sensorStreams &&
                  sensorStreams.length &&
                  sensorStreams.every((x) => selectedSensorStreams.includes(x))
                }
              />
              <label style={{ marginBottom: 0, marginLeft: "0.25rem", fontStyle: "italic" }} htmlFor="select-all">
                Select All
              </label>
            </fieldset>
          )}
          <fieldset>
            {sensorStreams && sensorStreams.length
              ? sensorStreams.map((x) => {
                  return (
                    <div key={x} style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: "0.5rem" }}>
                      <input
                        id={x}
                        type="checkbox"
                        onClick={(y) => {
                          toggleSelectedSensorStreams(x);
                        }}
                        checked={selectedSensorStreams.includes(x)}
                      />
                      <label style={{ marginBottom: 0, marginLeft: "0.25rem" }} htmlFor={x}>
                        {x}
                      </label>
                    </div>
                  );
                })
              : "There are no sensor streams defined"}
          </fieldset>
        </Loader>
        <div style={{ marginTop: "1rem", textAlign: "left" }}>
          <Text size="sm" c="dimmed">
            <b>
              <i>Note:</i>
            </b>{" "}
            Datasets that do not have all selected sensor streams or the target
            labeling will be dropped.
          </Text>
        </div>
      </div>
    </Card>
  );
};
