import { useState, Fragment } from 'react';
import {
  ModalBody,
  Button,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from 'reactstrap';

const Select_Normalizer = ({
  onBack,
  onNext,
  normalizer,
  setNormalizer,
  footer,
}) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [selectedNormalizer, setSelectedNormalizer] = useState(0);

  if (!normalizer.length) {
    return;
  }
  return (
    <Fragment>
      <div className="w-100 d-flex justify-content-between align-items-center mb-2">
        <div className="font-weight-bold h4 justify-self-start">
          6. Select Normalization
        </div>
      </div>
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
    </Fragment>
  );
};

export default Select_Normalizer;
