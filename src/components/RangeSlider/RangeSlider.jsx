import { useState } from 'react';
import './RangeSlider.css';

const RangeSlider = () => {
  const [valueRight, onsetValueRight] = useState(0);
  const [valueLeft, onsetValueLeft] = useState(1000);

  const setValueLeft = (e) => {
    console.log(e.target.value);
    onsetValueLeft(e.target.value);
  };

  const setValueRight = (e) => {
    console.log(e.target.value);
    onsetValueRight(e.target.value);
  };

  return (
    <div class="range">
      <div class="range-slider">
        <span class="range-selected"></span>
      </div>
      <div class="range-input">
        <input
          type="range"
          class="min"
          min="0"
          max="1000"
          value={valueLeft}
          step="10"
          onChange={setValueLeft}
        ></input>
        <input
          type="range"
          class="max"
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
