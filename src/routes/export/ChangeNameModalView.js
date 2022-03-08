// import React, { useState } from 'react';

// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   InputGroup,
//   InputGroupAddon,
//   Input,
//   InputGroupText
// } from 'reactstrap';

// export const ChangeNameModalView = ({
//   initialName,
//   onChangeName,
//   onClosed = () => {},
//   ...props
// }) => {
//   const [name, setName] = useState(initialName)
//   const handleSave = () => {
//     onChangeName(name);
//     onClosed();
//   }

//   return (
//     <Modal toggle={onClosed} {...props}>
//       <ModalHeader>Change Deployment Name</ModalHeader>
//       <ModalBody>
//         <InputGroup>
//           <InputGroupAddon addonType="prepend">
//             <InputGroupText>Name</InputGroupText>
//           </InputGroupAddon>
//           <Input
//             placeholder="Name"
//             value={name}
//             onChange={e => setName(e.target.value)}
//           />
//         </InputGroup>
//       </ModalBody>
//       <ModalFooter>
//         <Button className="mr-auto" onClick={handleSave} color="primary">Save</Button>
//         <Button onClick={onClosed}>Close</Button>
//       </ModalFooter>
//     </Modal>
//   )
// }
