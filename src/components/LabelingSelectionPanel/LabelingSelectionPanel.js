import React, { useState, useContext, Fragment, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
} from 'reactstrap';
import Select from 'react-select';
import './LabelingSelectionPanel.css';

import HelpModal from './HelpModal';

import NotificationContext from '../NotificationHandler/NotificationProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faQuestion } from '@fortawesome/free-solid-svg-icons';

import Checkbox from '../Common/Checkbox';
import useProjectRouter from '../../Hooks/ProjectRouter';
import { LabelingContext } from '../../routes/dataset/LabelingContext';
import useLabelings from '../../Hooks/useLabelings';
import { TimeSeriesContext } from '../../routes/dataset/TimeSeriesContext';

const hideLabelsSymbol = 'hide labels' + Math.floor(Math.random() * 1000);

const LabelingSelectionPanel = (props) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isTSDropdownOpen, setIsTSDropdownOpen] = useState(false);
  const { registerDatasetDownload } = useContext(NotificationContext);
  const [selectedTs, setSelectedTs] = useState([]);

  const { labelings } = useContext(LabelingContext);
  const { activeSeries, timeSeries } = useContext(TimeSeriesContext);
  console.log(activeSeries);

  const navigate = useProjectRouter();

  const toggleHelpModal = () => {
    setIsHelpModalOpen(!isHelpModalOpen);
  };

  const downloadDataSet = () => {
    registerDatasetDownload(props.dataset);
  };

  const handleLabelingClicked = (e, id) => {
    if (e) e.preventDefault();
    if (id === hideLabelsSymbol) {
      props.onHideLabels();
    } else {
      if (props.hideLabels) {
        props.onHideLabels();
      }
      props.onSelectedLabelingIdChanged(id);
    }
  };

  const onApplyTs = () => {
    props.setActiveSeries(selectedTs);
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
        {/* {props.timeSeries.map(elm => <div>{elm.name}</div>)} */}
        <Dropdown
          isOpen={isTSDropdownOpen}
          toggle={() => setIsTSDropdownOpen(!isTSDropdownOpen)}
          className="mr-2"
        >
          <DropdownToggle
            caret
            onClick={() => setIsTSDropdownOpen(!isTSDropdownOpen)}
          >
            Selected Timeseries:{' '}
            <div className="d-inline font-weight-normal">
              {activeSeries.length + '/' + timeSeries.length}
            </div>{' '}
          </DropdownToggle>
          <DropdownMenu>
            <div className="scrollable-dropdown">
              {timeSeries.map((elm) => {
                return (
                  <DropdownItem className="p-0 p-2">
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
                        <div className="ml-2">{elm.name}</div>
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

  const l = labelings.find((x) => x._id === props.selectedLabelingId);
  const name = l && l.name;

  return (
    <div>
      <div className="LabelingSelectionPanel p-1">
        <div className="d-flex align-items-center">
          <div className="d-flex">
            <TimeSeriesSelection></TimeSeriesSelection>
            <UncontrolledDropdown>
              <DropdownToggle caret>
                {props.hideLabels ? 'Select Labeling' : 'Selected Labeling: '}
                <div className="d-inline font-weight-normal">
                  {name || 'None'}
                </div>
              </DropdownToggle>
              <DropdownMenu className="scrollable-dropdown">
                {labelings.map((elm) => (
                  <DropdownItem
                    onClick={() => props.onSelectedLabelingIdChanged(elm._id)}
                  >
                    {elm.name}
                  </DropdownItem>
                ))}
                <DropdownItem divider></DropdownItem>
                <DropdownItem
                  className="font-weight-bold"
                  onClick={() => navigate('labelings/new')}
                >
                  + Add Labeling Set
                </DropdownItem>
                {props.hideLabels ? null : (
                  <Fragment>
                    <DropdownItem divider></DropdownItem>
                    <DropdownItem
                      className="text-danger"
                      onClick={props.onHideLabels}
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
          <Button id="btn-secondary" className="m-1" onClick={downloadDataSet}>
            <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
          </Button>
          <Button
            id="buttonOpenHelpModal"
            className="m-1"
            color="secondary"
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
