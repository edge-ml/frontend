import React from 'react';
import { Button } from 'reactstrap';
import Checkbox from '../../components/Common/Checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from '../../components/Common/EdgeMLTable';
import LabelingTableEntry from './LabelingTableEntry';

const LabelingTable = ({
  labelings,
  selectedLabelings,
  toggleCheck,
  updateLabeling,
  deleteLabeling,
  allSelected,
  selectAll
}) => {

  const deleteSelectedLabelings = async () => {
    const res = await Promise.all(selectedLabelings.map(elm => deleteLabeling(elm)))
  }

  return (
    <EdgeMLTable>
      <EdgeMLTableHeader>
        <div className="d-flex flex-row align-items-center p-1">
          <div className="ml-md-2 me-md-3 ">
            <Checkbox
              isSelected={allSelected}
              onClick={selectAll}
            ></Checkbox>
          </div>
          <Button
            className="ms-3 btn-delete"
            id="deleteDatasetsButton"
            size="sm"
            color="secondary"
            disabled={selectedLabelings.length === 0}
            onClick={deleteSelectedLabelings}
          >
            <FontAwesomeIcon
              className="me-2"
              icon={faTrashAlt}
            ></FontAwesomeIcon>
            Delete
          </Button>
        </div>
      </EdgeMLTableHeader>
      {labelings.map((labeling, index) => (
        <EdgeMLTableEntry>
          <LabelingTableEntry
            key={'labeling' + index}
            labeling={labeling}
            labelings={labelings}
            isSelected={selectedLabelings.includes(labeling._id)}
            updateLabeling={updateLabeling}
            deleteLabeling={deleteLabeling}
            toggleCheck={toggleCheck}
          ></LabelingTableEntry>
        </EdgeMLTableEntry>
      ))}
    </EdgeMLTable>
  );

  // return (
  //   <div className="ps-2 pe-2 ps-md-4 pe-md-4 pb-2">
  //     <Fragment>
  //       <div className="w-100 d-flex justify-content-between align-items-center mb-2">
  //         <div className="fw-bold h4 justify-self-start">
  //           LABELING SETS
  //         </div>
  //         <div className="justify-content-end">
  //           <Button
  //             outline
  //             onClick={props.onModalAddLabeling}
  //             className="btn-neutral ml-auto"
  //           >
  //             Create Labeling Set
  //           </Button>
  //         </div>
  //       </div>
  //       {props.labelings.length > 0 ? (
  //         <div style={{ borderRadius: 10 }}>
  //           <div className="datasets-header-wrapper d-flex d-flex justify-content-between flex-md-row flex-column align-content-baseline">
  //             <div className="d-flex flex-row align-items-center p-1">
  //               <div className="ml-md-2 me-md-3 ">
  //                 <Checkbox
  //                   isSelected={areAllSelected}
  //                   onClick={(e) => {
  //                     setAllSelected(!areAllSelected);
  //                     if (areAllSelected) {
  //                       props.deselectAll();
  //                     } else {
  //                       props.selectAll();
  //                     }
  //                   }}
  //                 ></Checkbox>
  //               </div>
  //               <Button
  //                 className="ms-3 btn-delete"
  //                 id="deleteDatasetsButton"
  //                 size="sm"
  //                 color="secondary"
  //                 disabled={props.selectedLabelings.length === 0}
  //                 onClick={props.onClickDeleteButton}
  //               >
  //                 <FontAwesomeIcon
  //                   className="me-2"
  //                   icon={faTrashAlt}
  //                 ></FontAwesomeIcon>
  //                 Delete
  //               </Button>
  //             </div>
  //           </div>
  //           <div
  //             className="w-100 position-relative"
  //             style={{
  //               border: '2px solid rgb(230, 230, 234)',
  //               borderRadius: '0px 0px 10px 10px',
  //               overflow: 'hidden',
  //             }}
  //           >
  //             {props.labelings.map((labeling, index) => (
  //               <LabelingTableEntry
  //                 key={labeling._id}
  //                 labeling={labeling}
  //                 labels={props.labels}
  //                 onClickEdit={props.onClickEdit}
  //                 index={index}
  //                 isSelected={props.selectedLabelings.includes(labeling['_id'])}
  //                 toggleCheck={props.toggleCheck}
  //                 onClickDeleteLabelingIcon={props.onClickDeleteLabelingIcon}
  //               />
  //             ))}
  //           </div>
  //         </div>
  //       ) : (
  //         <Container
  //           className="d-flex flex-column justify-content-center align-items-center"
  //           style={{ height: '75vh' }}
  //         >
  //           <div className="text-center">No labeling sets available yet.</div>
  //         </Container>
  //       )}
  //     </Fragment>
  //   </div>
  // );
};

export default LabelingTable;
