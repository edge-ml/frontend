import React, { useState } from "react";
import { Container, Button } from "reactstrap";
import Loader from "../../modules/loader";
import EditLabelingModal from "../../components/EditLabelingModal/EditLabelingModal";
import LabelingTable from "./LabelingTable";
import useLabelings from "../../Hooks/useLabelings";
import Page from "../../components/Common/Page";
import { Empty } from "../export/components/Empty";

const Labelings = () => {
  const { labelings, updateLabeling, addLabeling, deleteLabeling } = useLabelings();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLabelings, setSelectedLabelings] = useState([]);

  const onModalAddLabeling = () => {
    setEditModalOpen(true);
  };

  if (!labelings) {
    return <Loader loading></Loader>
  }


  const toggleCheck = (e, labeling) => {
    const isChecked = e.target.checked;
    setSelectedLabelings(prevSelectedLabelings => {
      if (isChecked) {
        return [...prevSelectedLabelings, labeling];
      } else {
        return prevSelectedLabelings.map(elm => elm._id).filter(id => id !== labeling._id);
      }
    });
  }


  const labelingIdSet = new Set(labelings.map(elm => elm._id)).size
  const selectedLabelingSet = new Set(selectedLabelings).size;
  const allSelected = labelingIdSet === selectedLabelingSet


  const selectAll = () => {
    console.log(allSelected)
    if (allSelected) {
      setSelectedLabelings([]);
    }
    else {
      setSelectedLabelings(labelings.map(elm => elm._id))
    }
  }

  console.log(selectedLabelings)

  return (
    <Loader loading={!labelings}>
      <Page
        header={
          <>
            <div className="fw-bold h4 justify-self-start">LABELING SETS</div>
            <div className="justify-content-end">
              <Button
                outline
                color="primary"
                onClick={onModalAddLabeling}
                className="btn-neutral ml-auto"
              >
                Create Labeling Set
              </Button>
            </div>
          </>
        }
      >
        {labelings.length === 0 ?
        <Empty>No labelings yet</Empty> :
        <LabelingTable
          labelings={labelings}
          updateLabeling={updateLabeling}
          deleteLabeling={deleteLabeling}
          selectedLabelings={selectedLabelings}
          toggleCheck={toggleCheck}
          allSelected={allSelected}
          selectAll={selectAll}
        ></LabelingTable>}
      </Page>
      <EditLabelingModal
        labelings={labelings}
        onCancel={() => setEditModalOpen(false)}
        onSave={(labeling) => {addLabeling(labeling); setEditModalOpen(false)}}
        isOpen={editModalOpen}
      ></EditLabelingModal>
    </Loader>
  );

  return (
    <Loader loading={!labelings}>
      <Container>
        <div className="mt-3">
          <LabelingTable
            labelings={labelings}
            selectedLabelings={[]}
            // onClick^Edit={this.onClickEdit}
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

        <EditLabelingModal
          isOpen={true}
        >
          
        </EditLabelingModal>


      {/* <EditLabelingModal
        datasets={this.state.datasets}
        labeling={this.state.modal.labeling}
        labelings={this.state.labelings}
        labels={this.state.modal.labels}
        isOpen={editModalOpen}
        onCloseModal={this.onCloseModal}
        onDeleteLabeling={this.onDeleteLabeling}
        onSave={this.onSave}
        isNewLabeling={this.state.modal.isNewLabeling}
        getConfirmStringLabelingSet={this.getConfirmStringLabelingSet}
      /> */}

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
