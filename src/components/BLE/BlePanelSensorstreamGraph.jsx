import "./BleActivated.css";

import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";

function BlePanelSensorstreamGraph(props) {
  const chartRef = useRef(null);

  // Function to update live data points
  const updateLiveData = () => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    const xAxis = chart.xAxis[0];
    const latestData = props.currentData;
    if (!latestData || latestData.length === 0) return;
    if (!latestData) return;

    const timeStamp = latestData[0];
    const shiftSeries = timeStamp - (props.recordingStartTime + 10000) > 0;

    for (let i = chart.series.length - 1; i >= 0; i--) {
      const series = chart.series[i];
      series.addPoint([timeStamp, latestData[1][i]], true, shiftSeries);
    }

    if (shiftSeries) {
      const windowSize = 10000; // 10 seconds in ms
      xAxis.setExtremes(timeStamp - windowSize, timeStamp);
    }
  };

  // // Effect to handle live update interval
  // useEffect(() => {
  //   intervalRef.current = window.setInterval(updateLiveData, interval_length);
  //   return () => {
  //     window.clearInterval(intervalRef.current);
  //   };
  // }, [interval_length, props.currentData, props.recordingStartTime]);

  useEffect(() => {
    updateLiveData();
  }
  , [props.currentData, props.recordingStartTime]);

  // Effect to update plotlines and plotbands when labelingData changes
  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;

    const xAxis = chart.xAxis[0];

    // Collect current labeling IDs
    const currentIds = new Set(
      props.labelingData.flatMap((label) => [
        `labelingStart-${label.plotId}`,
        `labelingArea-${label.plotId}`,
        `labelingEnd-${label.plotId}`,
      ])
    );

    // Remove plotLines not in current labelingData
    (xAxis.plotLines || []).forEach((pl) => {
      if (!currentIds.has(pl.id)) {
        xAxis.removePlotLine(pl.id);
      }
    });

    // Remove plotBands not in current labelingData
    (xAxis.plotBands || []).forEach((pb) => {
      if (!currentIds.has(pb.id)) {
        xAxis.removePlotBand(pb.id);
      }
    });

    // Helper functions to check existence
    const plotLineExists = (id) =>
      (xAxis.plotLines || []).some((pl) => pl.id === id);
    const plotBandExists = (id) =>
      (xAxis.plotBands || []).some((pb) => pb.id === id);

    // Add missing plotLines and plotBands
    for (const label of props.labelingData) {
      if (!plotLineExists(`labelingStart-${label.plotId}`)) {
        xAxis.addPlotLine({
          value: label.start,
          color: label.color,
          width: 5,
          id: `labelingStart-${label.plotId}`,
        });
      }
      if (!plotBandExists(`labelingArea-${label.plotId}`)) {
        xAxis.addPlotBand({
          from: label.start,
          to: label.end,
          color: label.color,
          className: "labelingArea",
          id: `labelingArea-${label.plotId}`,
        });
      }
      if (!plotLineExists(`labelingEnd-${label.plotId}`)) {
        xAxis.addPlotLine({
          value: label.end,
          color: label.color,
          width: 5,
          id: `labelingEnd-${label.plotId}`,
        });
      }
    }
  }, [props.labelingData]);

  return (
    <div className="m-2">
      <HighchartsReact
        highcharts={Highcharts}
        options={props.options}
        updateArgs={[true, true, true]}
        ref={chartRef}
      />
    </div>
  );
}

export default BlePanelSensorstreamGraph;
