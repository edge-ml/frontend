import React, { useState, useEffect } from 'react';
import { Input, Button } from 'reactstrap';
import Checkbox from '../../../components/Common/Checkbox';
const TextSearchFilter = ({
  selectedFilter,
  selectedFilterParams,
  labelings,
  currentFilterParams,
  setCurrentFilterParams,
}) => {
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (selectedFilter && selectedFilter.value === 'filterByName') {
      setUserInput(selectedFilterParams);
    } else {
      setCurrentFilterParams('');
    }
    return () => {};
  }, []);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    setCurrentFilterParams(e.target.value);
  };

  return (
    <div>
      <div className="mb-4">{'Search for datasets via name:\n'}</div>
      <div>
        <Input
          type="text"
          placeholder="Search..."
          value={userInput}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default TextSearchFilter;
