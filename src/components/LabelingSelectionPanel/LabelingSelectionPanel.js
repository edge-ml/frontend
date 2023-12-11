import React, { useState, useContext, Fragment } from 'react';
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

const hideLabelsSymbol = 'hide labels' + Math.floor(Math.random() * 1000);

const LabelingSelectionPanel = (props) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isTSDropdownOpen, setIsTSDropdownOpen] = useState(false);
  const { registerDatasetDownload } = useContext(NotificationContext);

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

  const TimeSeriesSelection = () => {
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
              {props.activeSeries.length + '/' + props.timeSeries.length}
            </div>{' '}
          </DropdownToggle>
          <DropdownMenu className="scrollable-dropdown">
            {props.timeSeries.map((elm) => {
              return (
                <DropdownItem className="p-0 p-2 dropdownItemTS">
                  <div
                    onClick={(e) => {
                      props.onClickSelectSeries(elm._id);
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <Checkbox
                        isSelected={props.activeSeries.includes(elm._id)}
                        onClick={() => console.log('click checkbox')}
                      ></Checkbox>
                      <div className="ml-2">{elm.name}</div>
                    </div>
                  </div>
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  };
  const l = props.labelings.find((x) => x._id === props.selectedLabelingId);
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
                {props.labelings.map((elm) => (
                  <DropdownItem
                    onClick={() => props.onSelectedLabelingIdChanged(elm._id)}
                  >
                    {elm.name}
                  </DropdownItem>
                ))}
                <DropdownItem divider></DropdownItem>
                <DropdownItem className="font-weight-bold">
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

  return (
    <Card
      id="labelingSelectionPanel"
      className="LabelingSelectionPanel edgeml-border edgeml-fade-one"
    >
      <CardBody className="text-left p-1 d-flex flex-wrap labeling-selection-panel_card-body">
        <div className="labelingSetBox d-flex">
          <Select
            className="m-1"
            placeholder="Labeling"
            value={
              props.hideLabels
                ? { label: 'Select Labeling', value: hideLabelsSymbol }
                : props.selectedLabelingId
                ? {
                    value: props.selectedLabelingId,
                    label:
                      'Labeling: ' +
                      props.labelings.find(
                        (x) => x._id === props.selectedLabelingId
                      ).name,
                  }
                : null
            }
            onChange={(x) => handleLabelingClicked(null, x.value)}
            options={[
              ...(props.hideLabels
                ? []
                : [{ label: 'Hide Labels', value: hideLabelsSymbol }]),
              ...props.labelings.map((x) => ({
                value: x._id,
                label: x.name,
              })),
            ]}
          />
          <Button
            id="buttonAddLabeling"
            className="m-1"
            color="secondary"
            onClick={props.onAddLabeling}
          >
            + Add Labeling Set
          </Button>
        </div>
        <div className="managementBox d-flex">
          <Button
            id="buttonDownloadDataset"
            className="m-1"
            color="primary"
            onClick={downloadDataSet}
          >
            Download as CSV
          </Button>
          {/* <Button
            id="buttonDeleteDataset"
            className="m-1"
            color="danger"
            onClick={() => {
              if (window.confirm('Are you sure to delete this dataset?')) {
                props.onDeleteDataset();
              }
            }}
          >
            Delete Dataset
          </Button> */}
          <Button
            id="buttonOpenHelpModal"
            className="m-1"
            color="secondary"
            onClick={toggleHelpModal}
          >
            Help
          </Button>
        </div>
      </CardBody>
      {isHelpModalOpen ? (
        <HelpModal isOpen={isHelpModalOpen} onCloseModal={toggleHelpModal} />
      ) : null}
    </Card>
  );
};

export default LabelingSelectionPanel;
