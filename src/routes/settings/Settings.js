import {
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import EditName from './EditName';
import DeleteProject from './DeleteProject';
import GenerateCode from './GenerateCode';
import UserEdit from './UserEdit';
import { Children, useState } from 'react';

// const SettingItem = ({ name, description, children }) => {
//   const [modalOpen, setModalOpen] = useState();

//   const toggleModal = () => setModalOpen(!modalOpen);

//   return (
//     <div>
//       <div className="p-2">
//         <div className="header-wrapper d-flex flex-column align-content-center">
//           <h5>{name}</h5>
//           <div>{description}</div>
//         </div>
//         <div className="body-wrapper p-2">
//           <div className="p-3">
//             <Button outline color="primary" onClick={toggleModal}>
//               Edit
//             </Button>
//           </div>
//         </div>
//       </div>
//       {modalOpen && (
//         <Modal isOpen={modalOpen}>
//           <ModalHeader>{name}</ModalHeader>
//           <ModalBody>{children}</ModalBody>
//           <ModalFooter>
//             <Button color="danger" onClick={toggleModal}>
//               Cancel
//             </Button>
//           </ModalFooter>
//         </Modal>
//       )}
//     </div>
//   );
// };

const SettingItem = ({ name, description, children }) => {
  return (
    <div className="p-2 my-2">
      <div className="header-wrapper d-flex flex-column align-content-center">
        <h5>{name}</h5>
        <div>{description}</div>
      </div>
      <div className="body-wrapper p-3">{children}</div>
    </div>
  );
};

const Settings = () => {
  return (
    <Container className="my-5">
      <h4 className="font-weight-bold">{'PROJECT SETTINGS'}</h4>
      <SettingItem
        name="Edit Project Name"
        description="Edit the name of this project"
      >
        <EditName></EditName>
      </SettingItem>
      <SettingItem
        name="Delete Project"
        description="Delete or remove the project"
      >
        <DeleteProject></DeleteProject>
      </SettingItem>
      <SettingItem
        name="Device API"
        description="Interact with edge-ml using API-keys"
      >
        <GenerateCode></GenerateCode>
      </SettingItem>
      <SettingItem
        name="Edit users"
        description="Add or remove users from the project"
      >
        <UserEdit></UserEdit>
      </SettingItem>
    </Container>
  );
};

export default Settings;
