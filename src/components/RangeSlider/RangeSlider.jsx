import { useState } from "react";
import "./RangeSlider.css";

const RangeSlider = () => {
  const [valueRight, onsetValueRight] = useState(0);
  const [valueLeft, onsetValueLeft] = useState(1000);

  const setValueLeft = (e) => {
    onsetValueLeft(e.target.value);
  };

  const setValueRight = (e) => {
    onsetValueRight(e.target.value);
  };

  return (
    <div className="range">
      <div className="range-slider">
        <span className="range-selected"></span>
      </div>
      <div className="range-input">
        <input
          type="range"
          className="min"
          min="0"
          max="1000"
          value={valueLeft}
          step="10"
          onChange={setValueLeft}
        ></input>
        <input
          type="range"
          className="max"
          min="0"
          max="1000"
          value={valueRight}
          step="10"
          onChange={setValueRight}
        ></input>
      </div>
    </div>
  );
};

export default RangeSlider;
