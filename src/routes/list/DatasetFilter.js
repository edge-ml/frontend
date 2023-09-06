import React, { useState } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import './DatasetFilter.css';

const DatasetFilter = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      toggle={toggleDropdown}
      size="sm"
      className="dataset-filter"
    >
      <DropdownToggle caret>Options</DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Menu Header</DropdownItem>
        <DropdownItem>Option 1</DropdownItem>
        <DropdownItem>Option 2</DropdownItem>
        <DropdownItem divider />
        <DropdownItem>Option 3</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DatasetFilter;
