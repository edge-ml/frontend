import { useEffect, useState } from 'react';
import { subscribeLabelingsAndLabels } from '../../../services/ApiServices/LabelingServices';
import '../index.css';

const Wizard_SelectLabeling = ({ labelings }) => {
  return (
    <div className="content">
      <h3>1. Select Labeling</h3>
      <div>
        {labelings.map((labeling) => (
          <div className="labelingRow">
            <input type="checkbox"></input>
            <div>{labeling.name}</div>
            <div>
              {labeling.labels.map((label) => (
                <div>{label.name}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wizard_SelectLabeling;
