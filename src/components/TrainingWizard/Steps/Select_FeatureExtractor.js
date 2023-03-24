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

const Select_FeatureExtractor = ({
  onBack,
  onNext,
  featureExtractors,
  setFeatureExtractor,
}) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [featureExtractor_index, setFeatureExtractor_index] = useState(0);

  console.log(featureExtractors);
  return (
    <div>
      <ModalBody>
        <h3>Select feature extraction</h3>
        <Dropdown
          isOpen={dropDownOpen}
          toggle={() => setDropDownOpen(!dropDownOpen)}
        >
          <DropdownToggle caret size="lg">
            {featureExtractors[featureExtractor_index].name}
          </DropdownToggle>
          <DropdownMenu>
            {featureExtractors.map((n, idx) => (
              <DropdownItem
                onClick={() => {
                  setFeatureExtractor_index(idx);
                  setFeatureExtractor(featureExtractors[idx]);
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

export default Select_FeatureExtractor;
