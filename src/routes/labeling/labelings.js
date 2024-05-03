import React, { Component, useContext } from 'react';
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
import useLabelings from '../../Hooks/useLabelings';
import { ProjectContext } from '../../ProjectProvider';

const Labelings = () => {
  const { currentProject } = useContext(ProjectContext);
  const { labelings } = useLabelings(currentProject);

  return (
    <Loader loading={!labelings}>
      <Container>
        <div className="mt-3">
          <LabelingTable
            labelings={labelings}
            selectedLabelings={[]}
            // onClickEdit={this.onClickEdit}
            // onModalAddLabeling={this.onModalAddLabeling}
            // labelingsToDelete={this.state.labelingsToDelete}
            // toggleCheck={this.toggleCheck}
            // selectAll={this.selectAll}
            // deselectAll={this.deselectAll}
            // onClickDeleteLabelingIcon={this.onClickDeleteLabelingIcon}
            // onClickDeleteButton={this.onClickDeleteButton}
          />
        </div>
      </Container>

      {/* <EditLabelingModal
                isNewLabeling={true}
                labeling={labelings}
            >
            </EditLabelingModal> */}

      {/* {this.state.modal.isOpen ? (
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
            ) : null} */}
      {/* {this.state.confirmationDialogueModal.isOpen ? (
                <ConfirmationDialogueModal
                    isOpen={this.state.confirmationDialogueModal.isOpen}
                    title={this.state.confirmationDialogueModal.title}
                    confirmString={this.state.confirmationDialogueModal.confirmString}
                    onCancel={this.state.confirmationDialogueModal.onCancel}
                    onConfirm={this.state.confirmationDialogueModal.onConfirm}
                />
            ) : null} */}
    </Loader>
  );
};

export default Labelings;
