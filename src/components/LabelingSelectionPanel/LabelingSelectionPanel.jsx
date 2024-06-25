import React, { useState, useContext, Fragment } from 'react';
import {
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
} from 'reactstrap';
import './LabelingSelectionPanel.css';

import HelpModal from './HelpModal';

import NotificationContext from '../NotificationHandler/NotificationProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faQuestion } from '@fortawesome/free-solid-svg-icons';

import Checkbox from '../Common/Checkbox';
import useProjectRouter from '../../Hooks/ProjectRouter';
import { LabelingContext } from '../../routes/dataset/LabelingContext';
import { DatasetContext } from '../../routes/dataset/DatasetContext';

const hideLabelsSymbol = 'hide labels' + Math.floor(Math.random() * 1000);

const LabelingSelectionPanel = ({ activeTimeSeries, setActiveTimeSeries, dataset, labelings, activeLabeling, setActiveLabeling }) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isTSDropdownOpen, setIsTSDropdownOpen] = useState(false);
  const { registerDatasetDownload } = useContext(NotificationContext);

  const [selectedTs, setSelectedTs] = useState(
    activeTimeSeries.map((elm) => elm._id),
  );

  const navigate = useProjectRouter();

  const toggleHelpModal = () => {
    setIsHelpModalOpen(!isHelpModalOpen);
  };

  const downloadDataSet = () => {
    registerDatasetDownload(dataset);
  };

  const onApplyTs = () => {
    setActiveTimeSeries(
      selectedTs.map((select_id) =>
        dataset.timeSeries.find((elm) => elm._id === select_id),
      ),
    );
  };

  const onClickSelectSeries = (elm_id) => {
    if (selectedTs.includes(elm_id)) {
      const idx = selectedTs.indexOf(elm_id);
      const arr = [...selectedTs];
      arr.splice(idx, 1);
      setSelectedTs(arr);
    } else {
      const arr = [...selectedTs];
      arr.push(elm_id);
      setSelectedTs(arr);
    }
  };

  const TimeSeriesSelection = () => {
    console.log(selectedTs);
    return (
      <div>
        <Dropdown
          isOpen={isTSDropdownOpen}
          toggle={() => setIsTSDropdownOpen(!isTSDropdownOpen)}
          className="me-2"
        >
          <DropdownToggle
            caret
            outline
            color='secondary'
            onClick={() => setIsTSDropdownOpen(!isTSDropdownOpen)}
          >
            Selected Timeseries:{' '}
            <div className="d-inline font-weight-normal">
              {activeTimeSeries.length + '/' + dataset.timeSeries.length}
            </div>{' '}
          </DropdownToggle>
          <DropdownMenu>
            <div className="scrollable-dropdown">
              {dataset.timeSeries.map((elm) => {
                return (
                  <DropdownItem key={elm._id} className="p-0 p-2">
                    <div
                      onClick={(e) => {
                        onClickSelectSeries(elm._id);
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <Checkbox
                          isSelected={selectedTs.includes(elm._id)}
                          onClick={() => console.log('click checkbox')}
                        ></Checkbox>
                        <div className="ms-2">{elm.name}</div>
                      </div>
                    </div>
                  </DropdownItem>
                );
              })}
            </div>
            <DropdownItem divider></DropdownItem>
            <DropdownItem className="p-1">
              <Button
                className="w-100"
                color="primary"
                outline
                onClick={onApplyTs}
              >
                Apply
              </Button>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  };

  const name = activeLabeling && activeLabeling.name;

  return (
    <div>
      <div className="LabelingSelectionPanel p-1">
        <div className="d-flex align-items-center">
          <div className="d-flex">
            <TimeSeriesSelection></TimeSeriesSelection>
            <UncontrolledDropdown>
              <DropdownToggle caret outline color='secondary'>
                {activeLabeling ? 'Select Labeling: ' : 'Selected Labeling: '}
                <div className="d-inline font-weight-normal">
                  {name || 'None'}
                </div>
              </DropdownToggle>
              <DropdownMenu className="scrollable-dropdown">
                {labelings.map((elm) => (
                  <DropdownItem key={elm._id} onClick={() => setActiveLabeling(elm)}>
                    {elm.name}
                  </DropdownItem>
                ))}
                <DropdownItem divider></DropdownItem>
                <DropdownItem
                  className="fw-bold"
                  onClick={() => navigate('labelings/new')}
                >
                  + Add Labeling Set
                </DropdownItem>
                {activeLabeling ? null : (
                  <Fragment>
                    <DropdownItem divider></DropdownItem>
                    <DropdownItem
                      className="text-danger"
                      onClick={() => setActiveLabeling(undefined)}
                    >
                      Hide Labels
                    </DropdownItem>
                  </Fragment>
                )}
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <Button outline id="btn-secondary" className="m-1" onClick={downloadDataSet}>
            <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
          </Button>
          <Button
            outline
            id="buttonOpenHelpModal"
            className="m-1"
            color="info"
            onClick={toggleHelpModal}
          >
            <FontAwesomeIcon icon={faQuestion}></FontAwesomeIcon>
          </Button>
        </div>
      </div>
      <div className="bottom-line"></div>
      {isHelpModalOpen ? (
        <HelpModal isOpen={isHelpModalOpen} onCloseModal={toggleHelpModal} />
      ) : null}
    </div>
  );
};

export default LabelingSelectionPanel;
