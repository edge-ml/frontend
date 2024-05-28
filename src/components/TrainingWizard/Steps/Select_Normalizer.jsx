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
      <h3 className="font-weight-bold">6. Select Normalization</h3>
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

Select_Normalizer.validate = () => {};

export default Select_Normalizer;
