import React, { useState } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

const PageSizeDropdown = ({ pageSize, setPageSize }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setIsOpen(false);
  };

  return (
    <Dropdown className="p-0" isOpen={isOpen} toggle={toggleDropdown}>
      <DropdownToggle caret>Datasets/page: {pageSize}</DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={() => handlePageSizeChange(5)}>5</DropdownItem>
        <DropdownItem onClick={() => handlePageSizeChange(10)}>10</DropdownItem>
        <DropdownItem onClick={() => handlePageSizeChange(20)}>20</DropdownItem>
        <DropdownItem onClick={() => handlePageSizeChange(50)}>50</DropdownItem>
        <DropdownItem onClick={() => handlePageSizeChange(100)}>
          100
        </DropdownItem>
        {/* Add more page size options as needed */}
      </DropdownMenu>
    </Dropdown>
  );
};

export default PageSizeDropdown;
