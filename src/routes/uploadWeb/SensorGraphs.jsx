import React from "react";
import { Button } from "@mantine/core";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";

export const SensorGraphs = ({ sensorStore, dataPreview, setDataPreview }) => (
  <div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>Data preview is {dataPreview ? "enabled" : "paused"}.</span>
      <Button
        variant="outline"
        color={dataPreview ? "gray" : "blue"}
        onClick={() => setDataPreview(!dataPreview)}
      >
        {dataPreview ? "Pause" : "Resume"}
      </Button>
    </div>
    {Object.entries(sensorStore).map(([sensor, value]) => (
      <div style={{ marginTop: "1rem" }}>
        <HighchartsReact
          highcharts={Highcharts}
          containerProps={{ style: { width: "calc(95%)", margin: "auto" } }}
          options={{
            chart: {
              animation: Highcharts.svg,
            },
            boost: {
              useGPUTranslations: true,
              seriesThreshold: 1,
            },
            series: Object.entries(value).map(([component, data]) => ({
              name: component,
              data: data,
              marker: {
                enabled: false,
              },
            })),
            title: {
              text: sensor,
            },
            xAxis: {
              labels: {
                enabled: false,
                crosshair: false,
                rotation: 20,
                overflow: "allow",
              },
            },
            yAxis: {
              title: false,
              labels: {
                enabled: true,
              },
            },
          }}
        />
      </div>
    ))}
  </div>
);
