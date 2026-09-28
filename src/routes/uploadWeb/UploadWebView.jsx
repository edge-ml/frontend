import React from "react";
import { Container } from "@mantine/core";

export const UploadWebView = ({ sensorList, datasetSettings, graph, fabs }) => {
  return (
    <Container>
      {sensorList || datasetSettings ? (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {sensorList ? (
            <div style={{ flex: "1 1 50%", paddingTop: "1rem" }}>
              <div style={{ padding: "0.5rem" }}>
                <div>
                  <h4>Sensor Selection</h4>
                  <span>Select sensors you want to record in a dataset.</span>
                </div>
                <div>{sensorList}</div>
              </div>
            </div>
          ) : null}
          {datasetSettings ? (
            <div style={{ flex: "1 1 50%", paddingTop: "1rem" }}>
              <div style={{ padding: "0.5rem" }}>
                <div>
                  <h4>Dataset Configuration</h4>
                </div>
                <div style={{ padding: "1rem" }}>{datasetSettings}</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {graph ? (
        <div style={{ paddingTop: "1rem" }}>
          <div style={{ padding: "0.5rem" }}>
            <div>
              <h4>Data Preview</h4>
            </div>
            <div style={{ padding: "1rem" }}>{graph}</div>
          </div>
        </div>
      ) : null}
      <div style={{ paddingBottom: "1rem" }} />
      <div style={{ position: "fixed", bottom: "24px", right: "24px" }}>
        {fabs}
      </div>
    </Container>
  );
};
