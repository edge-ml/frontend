import React, { Fragment, useState } from "react";
import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Checkbox } from "@mantine/core";
import LabelBadge from "../../components/Common/LabelBadge";
import EditLabelingModal from "../../components/EditLabelingModal/EditLabelingModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmModal";

const LabelingTableEntry = ({
  labelings,
  labeling,
  isSelected,
  toggleCheck,
  updateLabeling,
  deleteLabelings,
}) => {
  const [labelingModalOpen, setLabelingModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <Fragment>
      <Group
        align="center"
        wrap="nowrap"
        className="p-2 ms-2 me-0 ml-md-3 me-md-3"
      >
        <Checkbox
          checked={isSelected}
          onChange={(e) => toggleCheck(e, labeling)}
        />
        <Group align="center" wrap="nowrap" style={{ flex: 1 }}>
          <Box className="text-left align-self-center col-lg-4 col-xl-3">
            <div className="text-left d-inline-block m-2 text-break">
              <Text
                fw={labeling.name !== "" ? 700 : 400}
                fs={labeling.name !== "" ? "normal" : "italic"}
                size="xl"
              >
                {labeling.name !== "" ? labeling.name : "Untitled"}
              </Text>
            </div>
          </Box>
          <Box className="d-none d-lg-block align-self-center" style={{ flex: 1 }}>
            <div className="d-flex flex-wrap h-100 justify-content-start">
              <Labeling labeling={labeling} />
            </div>
          </Box>
          <Group
            justify="flex-end"
            wrap="nowrap"
            className="col-2 p-0"
            style={{ marginLeft: "auto" }}
          >
            <ActionIcon
              size="lg"
              variant="outline"
              color="red"
              onClick={() => setDeleteModalOpen(true)}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </ActionIcon>
            <ActionIcon
              size="lg"
              variant="outline"
              color="blue"
              onClick={() => setLabelingModalOpen(true)}
            >
              <FontAwesomeIcon icon={faPen} />
            </ActionIcon>
          </Group>
        </Group>
      </Group>
      <EditLabelingModal
        labelings={labelings}
        currentLabeling={labeling}
        isOpen={labelingModalOpen}
        onCancel={() => setLabelingModalOpen(false)}
        onSave={(labeling) => {
          updateLabeling(labeling);
          setLabelingModalOpen(false);
        }}
        onDelete={(labeling) => {
          deleteLabelings([labeling.id]);
          setLabelingModalOpen(false);
        }}
      ></EditLabelingModal>
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onConfirm={() => {
          deleteLabelings([labeling.id]);
          setDeleteModalOpen(false);
        }}
        onCancel={() => setDeleteModalOpen(false)}
      >
        <div>
          <div>Are you sure you want to delete this labeling:</div>
          <div className="m-2">{labeling.name}</div>
        </div>
      </DeleteConfirmationModal>
    </Fragment>
  );
};

export default LabelingTableEntry;

const Labeling = (props) => {
  const labels = props.labeling.labels;

  if (labels.length === 0) {
    return null;
  } else {
    return (
      <div>
        {labels.map((label, index) => {
          return (
            <LabelBadge className="mx-1" key={label.id} color={label.color}>
              {label.name !== "" ? label.name : "Untitled"}{" "}
            </LabelBadge>
          );
        })}
      </div>
    );
  }
};
