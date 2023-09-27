import React, { useState } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import './DatasetFilter.css';

const DatasetFilter = ({
  sortAlphaDesc,
  sortAlphaAsc,
  sortDateAsc,
  sortDateDesc,
  filterDropDownIsOpen,
  setFilterDropdownIsOpen,
  selectedFilter,
  setSelectedFilter,
}) => {
  const toggleDropdown = () => {
    setFilterDropdownIsOpen(!filterDropDownIsOpen);
  };

  const handleItemClick = (e) => {
    sortDatasets(e.currentTarget.getAttribute('data-dropdownvalue'));
    setSelectedFilter(e.currentTarget.textContent);
    toggleDropdown();
  };

  const sortDatasets = (dropdownvalue) => {
    switch (dropdownvalue) {
      case 'sortAlphaDesc':
        sortAlphaDesc();
        break;
      case 'sortAlphaAsc':
        sortAlphaAsc();
        break;
      case 'sortDateDesc':
        sortDateDesc();
        break;
      case 'sortDateAsc':
        sortDateAsc();
        break;
      default:
    }
  };

  return (
    <Dropdown
      direction="left"
      isOpen={filterDropDownIsOpen}
      toggle={toggleDropdown}
      size="sm"
      className="dataset-filter"
    >
      <DropdownToggle caret>{selectedFilter || 'Sort'}</DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Filter Selection</DropdownItem>
        <DropdownItem
          onClick={handleItemClick}
          data-dropdownvalue="sortAlphaDesc"
        >
          Alphabetical (descending)
        </DropdownItem>
        <DropdownItem
          onClick={handleItemClick}
          data-dropdownvalue="sortAlphaAsc"
        >
          Alphabetical (ascending)
        </DropdownItem>
        <DropdownItem
          onClick={handleItemClick}
          data-dropdownvalue="sortDateDesc"
        >
          Recording Date (descending)
        </DropdownItem>
        <DropdownItem
          onClick={handleItemClick}
          data-dropdownvalue="sortDateAsc"
        >
          Recording Date (ascending)
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem>Labeling Set</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DatasetFilter;
