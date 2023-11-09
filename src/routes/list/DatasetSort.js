import React, { useState } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './DatasetFilter.css';

const DatasetSort = ({
  setSortingMethod,
  sortingDropDownIsOpen,
  setSortingDropdownIsOpen,
  selectedSortingString,
  setSelectedSortingString,
  applySorting,
}) => {
  const toggleDropdown = () => {
    setSortingDropdownIsOpen(!sortingDropDownIsOpen);
  };

  const handleItemClick = (e) => {
    applySorting(e.currentTarget.getAttribute('data-dropdownvalue'));
    setSelectedSortingString(e.currentTarget.textContent);
    setSortingMethod(e.currentTarget.getAttribute('data-dropdownvalue'));
    toggleDropdown();
  };

  return (
    <Dropdown
      direction="left"
      isOpen={sortingDropDownIsOpen}
      toggle={toggleDropdown}
      size="sm"
      className="dataset-sorting p-0"
    >
      <DropdownToggle caret>
        {selectedSortingString || (
          <FontAwesomeIcon icon={faSort}></FontAwesomeIcon>
        )}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Sorting Method</DropdownItem>
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
      </DropdownMenu>
    </Dropdown>
  );
};

export default DatasetSort;
