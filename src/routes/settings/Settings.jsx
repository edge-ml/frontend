import React from "react";
import { Container, Paper, Stack, Text, Title } from "@mantine/core";
import EditName from "./EditName";
import DeleteProject from "./DeleteProject";
import GenerateCode from "./GenerateCode";
import UserEdit from "./UserEdit";

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
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="xs">
        <Title order={5}>{name}</Title>
        <Text c="dimmed">{description}</Text>
        <div>{children}</div>
      </Stack>
    </Paper>
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
