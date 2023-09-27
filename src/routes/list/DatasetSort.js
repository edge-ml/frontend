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
  sortAlphaDesc,
  sortAlphaAsc,
  sortDateAsc,
  sortDateDesc,
  sortingDropDownIsOpen,
  setSortingDropdownIsOpen,
  selectedSorting,
  setSelectedSorting,
}) => {
  const toggleDropdown = () => {
    setSortingDropdownIsOpen(!sortingDropDownIsOpen);
  };

  const handleItemClick = (e) => {
    sortDatasets(e.currentTarget.getAttribute('data-dropdownvalue'));
    setSelectedSorting(e.currentTarget.textContent);
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
      isOpen={sortingDropDownIsOpen}
      toggle={toggleDropdown}
      size="sm"
      className="dataset-sorting p-0"
    >
      <DropdownToggle caret>
        {selectedSorting || <FontAwesomeIcon icon={faSort}></FontAwesomeIcon>}
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
