import React, { useState, useContext } from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import Select from 'react-select';
import './LabelingSelectionPanel.css';

import HelpModal from './HelpModal';

import NotificationContext from '../NotificationHandler/NotificationProvider';

const hideLabelsSymbol = 'hide labels' + Math.floor(Math.random() * 1000);

const LabelingSelectionPanel = (props) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const { registerDownload } = useContext(NotificationContext);

  const toggleHelpModal = () => {
    setIsHelpModalOpen(!isHelpModalOpen);
  };

  const downloadDataSet = () => {
    registerDownload([props.dataset]);
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
      <HelpModal isOpen={isHelpModalOpen} onCloseModal={toggleHelpModal} />
    </Card>
  );
};

export default LabelingSelectionPanel;
