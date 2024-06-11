import React, { useContext, useState } from "react";
import { Container, Button } from "reactstrap";
import Loader from "../../modules/loader";
import EditLabelingModal from "../../components/EditLabelingModal/EditLabelingModal";
import LabelingTable from "./LabelingTable";
import useLabelings from "../../Hooks/useLabelings";
import { ProjectContext } from "../../ProjectProvider";
import Page from "../../components/Common/Page";
import { Empty } from "../export/components/Empty";

const Labelings = () => {
  const { currentProject } = useContext(ProjectContext);
  const { labelings } = useLabelings(currentProject);

  const [editModalOpen, setEditModalOpen] = useState(true);

  const onModalAddLabeling = () => {
    setEditModalOpen(true)
  };

  if (!labelings) {
    return <Loader loading></Loader>
  }


  return (
    <Loader loading={!labelings}>
      <Page
        header={
          <>
            <div className="fw-bold h4 justify-self-start">LABELING SETS</div>
            <div className="justify-content-end">
              <Button
                outline
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
          selectedLabelings={[]}
        ></LabelingTable>}
      </Page>
      <EditLabelingModal
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
