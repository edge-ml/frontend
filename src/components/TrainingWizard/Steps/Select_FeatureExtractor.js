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
      <h3 className="font-weight-bold">5. Select Feature Extractor</h3>
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

Select_FeatureExtractor.validate = () => {};

export default Select_FeatureExtractor;
