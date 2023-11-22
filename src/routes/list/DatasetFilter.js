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

const DatasetFilter = ({
  filterDropDownIsOpen,
  setFilterDropdownIsOpen,
  selectedFilter,
  setSelectedFilter,
}) => {
  const [filterText, setFilterText] = useState(null);
  const toggleDropdown = () => {
    setFilterDropdownIsOpen(!filterDropDownIsOpen);
  };

  const handleItemClick = (e) => {
    sortDatasets(e.currentTarget.getAttribute('data-dropdownvalue'));
    setFilterText(e.currentTarget.textContent);
    toggleDropdown();
  };

  const sortDatasets = (dropdownvalue) => {
    setSelectedFilter(dropdownvalue);
  };

  return (
    <Dropdown
      direction="left"
      isOpen={filterDropDownIsOpen}
      toggle={toggleDropdown}
      size="sm"
      className="dataset-filter"
    >
      <DropdownToggle caret>
        {filterText || <FontAwesomeIcon icon={faSort} />}
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

export default DatasetFilter;
