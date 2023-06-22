import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Dropdown, DropdownMenu, DropdownItem, DropdownToggle, Badge } from 'reactstrap';

export const BleLabelingMenu = ({ labelings, selectedLabeling, handleSelectLabeling, shortcutKeys }) => {

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => {
        setDropdownOpen(prev => !prev);
    }

    return (
        <div className="mr-2 mt-2" >
            <div className="header-wrapper d-flex justify-content-between align-content-center ">
                <h4>4. Labelings</h4>
                <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className='position-relative p-0'>
                    <DropdownToggle caret>Labelings</DropdownToggle>
                    <DropdownMenu>
                        {/* <DropdownItem header>Labelings</DropdownItem> */}
                        {labelings.map(labeling => (
                            <DropdownItem key={labeling.name} onClick={e => handleSelectLabeling(labeling)}>{labeling.name}</DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            </div>
            <div className="body-wrapper p-3 d-flex flex-column">
                <div className='d-flex mb-2 flex-wrap'>
                    {selectedLabeling && selectedLabeling.labels.map((label, labelIdx) => (
                        <div key={label._id} className='d-flex flex-column align-items-center mr-1'>
                            <Badge
                                style={{
                                    backgroundColor: label.color,
                                    cursor: "default",
                                }}
                            >
                                {label.name}
                            </Badge>
                            <span>{shortcutKeys[labelIdx]}</span>
                        </div>
                    ))}
                </div>
                <span>To start/stop labeling the data during recording:</span>
                <span>Press the shortcut key on the keyboard which corresponds the desired label.</span>
            </div>
        </div>
    )
}