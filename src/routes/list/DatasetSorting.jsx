import React, { useState } from "react";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

const sortingOptions = {
  alphaDesc: "Alphabetical (descending)",
  alphaAsc: "Alphabetical (ascending)",
  dateDesc: "Recording Date (descending)",
  dateAsc: "Recording Date (ascending)",
};

const DatasetSorting = ({ setSelectedSorting, selectedSorting }) => {
  const [sortDropDownIsOpen, setSortDropdownIsOpen] = useState(false);

  const toggleDropdown = () => {
    setSortDropdownIsOpen(!sortDropDownIsOpen);
  };

  const handleItemClick = (value) => {
    setSelectedSorting(value);
    toggleDropdown();
  };

  return (
    <Dropdown
      direction="left"
      isOpen={sortDropDownIsOpen}
      toggle={toggleDropdown}
      size="sm"
      className="dataset-sorting"
    >
      <DropdownToggle caret outline>
        {sortingOptions[selectedSorting] || <FontAwesomeIcon icon={faSort} />}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Filter Selection</DropdownItem>
        {Object.entries(sortingOptions).map(([value, label]) => (
          <DropdownItem
            key={value}
            onClick={() => handleItemClick(value)}
            data-dropdownvalue={value}
          >
            {label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default DatasetSorting;
