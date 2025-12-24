import React from "react";
import { Container, Stack, Text, Title } from "@mantine/core";
import EditName from "./EditName";
import DeleteProject from "./DeleteProject";
import GenerateCode from "./GenerateCode";
import UserEdit from "./UserEdit";
import "./Settings.css";
import "../../components/Common/EdgeMLTable/index.css";

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
    <div className="settings-item">
      <div className="table-header-wrapper settings-item-header">
        <Stack gap={2}>
          <Title order={5}>{name}</Title>
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        </Stack>
      </div>
      <div className="table-body-wrapper settings-item-body">{children}</div>
    </div>
  );
};

const Settings = () => {
  return (
    <Container className="my-5">
      <Stack gap="lg">
        <Title order={3}>PROJECT SETTINGS</Title>
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
      </Stack>
    </Container>
  );
};

export default Settings;
