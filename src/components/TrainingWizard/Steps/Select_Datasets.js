import { useEffect, useState } from 'react';
import { getDatasets } from '../../../services/ApiServices/DatasetServices';

const Wizard_SelectDataset = ({ datasets }) => {
  return (
    <div>
      <h3>2. Select datasets</h3>
      <div>
        {datasets.map((dataset) => {
          console.log(dataset);
          return <div>{dataset.name}</div>;
        })}
      </div>
    </div>
  );
};

export default Wizard_SelectDataset;
