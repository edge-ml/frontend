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

const Select_FeatureExtractor = ({
  onBack,
  onNext,
  featureExtractors,
  setFeatureExtractor,
  footer,
}) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [featureExtractor_index, setFeatureExtractor_index] = useState(0);

  if (featureExtractors.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <div className="w-100 d-flex justify-content-between align-items-center mb-2">
        <div className="font-weight-bold h4 justify-self-start">
          5. Select Feature Extractor
        </div>
      </div>
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
    </Fragment>
  );
};

export default Select_FeatureExtractor;
