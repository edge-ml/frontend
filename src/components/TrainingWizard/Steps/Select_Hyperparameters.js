import { useEffect, useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
} from 'reactstrap';
import { getModels } from '../../../services/ApiServices/MlService';

const Wizard_Hyperparameters = ({ classifier }) => {
  return (
    <div>
      {console.log(classifier)}
      <h3>3. Select Classifier</h3>
    </div>
  );
};

export default Wizard_Hyperparameters;
