import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './DatasetFilter.css';
import { useState } from 'react';

const DatasetSorting = ({
  sortDropDownIsOpen,
  setSortDropdownIsOpen,
  selectedSorting,
  setSelectedSorting,
}) => {
  const [sortingText, setSortingText] = useState(null);

  const toggleDropdown = () => {
    setSortDropdownIsOpen(!sortDropDownIsOpen);
  };

  const handleItemClick = (e) => {
    sortDatasets(e.currentTarget.getAttribute('data-dropdownvalue'));
    setSortingText(e.currentTarget.textContent);
    toggleDropdown();
  };

  const sortDatasets = (dropdownvalue) => {
    setSelectedSorting(dropdownvalue);
  };

  return (
    <Dropdown
      direction="left"
      isOpen={sortDropDownIsOpen}
      toggle={toggleDropdown}
      size="sm"
      className="dataset-sorting"
    >
      <DropdownToggle caret>
        {sortingText || <FontAwesomeIcon icon={faSort} />}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Filter Selection</DropdownItem>
        <DropdownItem onClick={handleItemClick} data-dropdownvalue="alphaDesc">
          Alphabetical (descending)
        </DropdownItem>
        <DropdownItem onClick={handleItemClick} data-dropdownvalue="alphaAsc">
          Alphabetical (ascending)
        </DropdownItem>
        <DropdownItem onClick={handleItemClick} data-dropdownvalue="dateDesc">
          Recording Date (descending)
        </DropdownItem>
        <DropdownItem onClick={handleItemClick} data-dropdownvalue="dateAsc">
          Recording Date (ascending)
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DatasetSorting;
