import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesDisplay from "./TimeSeriesDisplay";
import ChartSlider from "./ChartSlider";
import DeleteModal from "../../components/Common/DeleteModal";

const TimeSeriesSection = ({ }) => {

  const {
    activeTimeSeries,
    setStartEnd,
    onDeleteSelectedLabel
  } = useContext(DatasetContext);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const handleKeys = (e) => {
    console.log(e.key)
    if (e.key === "Delete") {
      setDeleteModalOpen(true);
    }
    e.preventDefault();
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeys);
    return () => {
      document.removeEventListener("keydown", handleKeys);
    };
  })


  const globalStart = Math.min(...activeTimeSeries.map((elm) => elm.start));
  const globalEnd = Math.max(...activeTimeSeries.map((elm) => elm.end));

  return (
    <>
      <ChartSlider start={globalStart} end={globalEnd} setStartEnd={setStartEnd}></ChartSlider>
      <div className="flex-grow-1 overflow-auto">
        {activeTimeSeries.map((elm, index) => (
          <TimeSeriesDisplay
            key={elm._id + index}
            timeSeries={elm}
          ></TimeSeriesDisplay>
        ))}
      </div>
      <DeleteModal
        isOpen={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onDelete={() => { onDeleteSelectedLabel(); setDeleteModalOpen(false) }}
      >The selected label</DeleteModal>
    </>
  );
};

export default TimeSeriesSection;
