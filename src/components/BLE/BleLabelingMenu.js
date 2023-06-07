import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, Dropdown, DropdownMenu, DropdownItem, DropdownToggle, Badge } from 'reactstrap';

export const BleLabelingMenu = ({ labelings, selectedLabeling, selectedLabel, handleSelectLabeling, handleSelectLabel, shortcutKeys }) => {

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => {
        setDropdownOpen(prev => !prev);
    }

    return (
        <Card className="text-left">
          <CardHeader>
            <h4>4. Labelings</h4>
          </CardHeader>
          <CardBody className='d-flex flex-column'>
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle caret>Labelings</DropdownToggle>
                <DropdownMenu>
                    {/* <DropdownItem header>Labelings</DropdownItem> */}
                    {labelings.map(labeling => (
                        <DropdownItem key={labeling.name} onClick={e => handleSelectLabeling(labeling)}>{labeling.name}</DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
            <div className='d-flex mb-2'>
            {selectedLabeling && selectedLabeling.labels.map((label, labelIdx) => (
                <div key={label._id} className='d-flex flex-column align-items-center mr-1'>
                    <Badge 
                        style={{
                            backgroundColor: label.color, 
                            border: label._id === selectedLabel?._id ? '0.2em outset': '0.2em solid transparent'}}
                        onClick={e => handleSelectLabel(label)}
                    >
                        {label.name}
                    </Badge>
                    <span>{shortcutKeys[labelIdx]}</span>
                </div>
            ))}
            </div>
            <span>To start/stop labeling the data during recording:</span>
            <span>Press the shortcut key on the keyboard which corresponds the desired label.</span>
          </CardBody>
        </Card>
    )
}