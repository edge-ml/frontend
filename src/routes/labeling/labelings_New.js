import React, { Component, useEffect, useState } from 'react';
import { Container, Col, Row, Table, Badge, Button } from 'reactstrap';
import Loader from '../../modules/loader';
import EditLabelingModal from '../../components/EditLabelingModal/EditLabelingModal';
import { getDatasets } from '../../services/ApiServices/DatasetServices';
import {
  updateLabelingandLabels,
  subscribeLabelingsAndLabels,
  addLabeling,
  deleteLabeling,
  deleteMultipleLabelings,
} from '../../services/ApiServices/LabelingServices';
import LabelingTable from './LabelingTable';
import ConfirmationDialogueModal from '../../components/ConfirmationDilaogueModal/ConfirmationDialogueModal';

const LabelingPage = () => {
  const [datasets, setDatasets] = useState(undefined);
  const [labelings, setLabelings] = useState(undefined);
  const [labelingsToDelete, setLabelingsToDelete] = useState([]);

  useEffect(() => {
    Promise.all([getDatasets(), subscribeLabelingsAndLabels()]).then((res) => {
      setDatasets(res[0]);
      setLabelings(res[1]);
    });
  }, []);

  const toggleModal = () => {};

  const onModalAddLabeling = () => {
    this.toggleModal({ name: '', labels: [] }, true);
  };

  const toggleCheck = (e, labelingId) => {
    const checked = labelingsToDelete.includes(labelingId);
    if (!checked) {
      setLabelingsToDelete([...labelingsToDelete, labelingId]);
    } else {
      setLabelingsToDelete(labelingsToDelete.filter((id) => id !== labelingId));
    }
  };

  const selectAll = () => {
    setLabelingsToDelete(labelings.map((elm) => elm._id));
  };

  const deselectAll = () => {
    setLabelingsToDelete([]);
  };

  return (
    <Loader loading={true}>
      <Container>
        <div className="mt-3">
          <LabelingTable
            labelings={labelings}
            onClickEdit={(labeling) => toggleModal(labeling, false)}
            labels={undefined}
            onModalAddLabeling={onModalAddLabeling}
            labelingsToDelete={labelingsToDelete}
            toggleCheck={toggleCheck}
            selectAll={selectAll}
            deselectAll={deselectAll}
            onClickDeleteLabelingIcon={this.onClickDeleteLabelingIcon}
            onClickDeleteButton={this.onClickDeleteButton}
          />
        </div>
      </Container>
      {this.state.modal.isOpen ? (
        <EditLabelingModal
          datasets={this.state.datasets}
          labeling={this.state.modal.labeling}
          labelings={this.state.labelings}
          labels={this.state.modal.labels}
          isOpen={this.state.modal.isOpen}
          onCloseModal={this.onCloseModal}
          onDeleteLabeling={this.onDeleteLabeling}
          onSave={this.onSave}
          isNewLabeling={this.state.modal.isNewLabeling}
          getConfirmStringLabelingSet={this.getConfirmStringLabelingSet}
        />
      ) : null}
      {this.state.confirmationDialogueModal.isOpen ? (
        <ConfirmationDialogueModal
          isOpen={this.state.confirmationDialogueModal.isOpen}
          title={this.state.confirmationDialogueModal.title}
          confirmString={this.state.confirmationDialogueModal.confirmString}
          onCancel={this.state.confirmationDialogueModal.onCancel}
          onConfirm={this.state.confirmationDialogueModal.onConfirm}
        />
      ) : null}
    </Loader>
  );
};

export default LabelingPage;
