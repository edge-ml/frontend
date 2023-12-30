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
      size="sm"
      isOpen={sortDropDownIsOpen}
      toggle={toggleDropdown}
      className="dataset-sorting"
      outline
    >
      <DropdownToggle caret>
        {sortingText || <FontAwesomeIcon icon={faSort} />}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Sorting</DropdownItem>
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
