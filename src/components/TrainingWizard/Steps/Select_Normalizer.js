import { useState } from 'react';
import {
  ModalBody,
  Button,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from 'reactstrap';

const Select_Normalizer = ({ onBack, onNext, normalizer, setNormalizer }) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [selectedNormalizer, setSelectedNormalizer] = useState(0);

  if (!normalizer.length) {
    return;
  }
  console.log(normalizer);
  console.log(normalizer[0]);
  console.log(selectedNormalizer);
  return (
    <div>
      <ModalBody>
        <h3>Select normalization</h3>
        <Dropdown
          isOpen={dropDownOpen}
          toggle={() => setDropDownOpen(!dropDownOpen)}
        >
          <DropdownToggle caret size="lg">
            {normalizer[selectedNormalizer].name}
          </DropdownToggle>
          <DropdownMenu>
            {normalizer.map((n, idx) => (
              <DropdownItem
                onClick={() => {
                  setSelectedNormalizer(idx);
                  setNormalizer(normalizer[idx]);
                }}
              >
                {n.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </ModalBody>
      <ModalFooter className="fotter">
        <Button onClick={onBack}>Back</Button>
        <div>2/3</div>
        <Button onClick={onNext}>Next</Button>
      </ModalFooter>
    </div>
  );
};

export default Select_Normalizer;
