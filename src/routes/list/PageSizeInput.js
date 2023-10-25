import React, { useState } from 'react';
import { Form, FormGroup, FormText, Input, Col, Row } from 'reactstrap';

const PageSizeInput = ({ pageSize, setPageSize }) => {
  const [error, setError] = useState('');
  const [value, setValue] = useState(pageSize);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const inputValue = e.target.value;
      //only numeric
      const numericValue = inputValue.replace(/[^0-9]/g, '');
      setValue(numericValue);
      if (numericValue.length < 1 || numericValue < 5) {
        setError('Please choose a size >= 5.');
      } else {
        setPageSize(numericValue);
        setError('');
      }
      setPageSize(numericValue);
    }
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="mr-2">
      <FormGroup>
        <Input
          type="number"
          name="page size"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter page size"
        />
        {error && <FormText color="danger">{error}</FormText>}
      </FormGroup>
    </div>
  );
};

export default PageSizeInput;
