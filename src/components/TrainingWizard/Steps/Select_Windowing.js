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
import { HyperparameterView } from '../../Hyperparameters/HyperparameterView';
const Select_Windowing = ({
  onBack,
  onNext,
  windowers,
  setSelectedWindower,
  setWindower,
  footer,
}) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [window_index, set_window_index] = useState(0);

  if (!windowers.length) {
    return;
  }

  const onParameterChanged = ({ parameter_name, state }) => {
    const idx = windowers[window_index].parameters.findIndex(
      (elm) => elm.parameter_name === parameter_name
    );
    windowers[window_index].parameters[idx].value = state;
    setWindower([...windowers]);
    setSelectedWindower(windowers[window_index]);
  };

  return (
    <Fragment>
      <h3 className="font-weight-bold">4. Select Windowing</h3>
      <Dropdown
        isOpen={dropDownOpen}
        toggle={() => setDropDownOpen(!dropDownOpen)}
      >
        <DropdownToggle caret size="lg">
          {windowers[window_index].name}
        </DropdownToggle>
        <DropdownMenu>
          {windowers.map((n, idx) => (
            <DropdownItem
              onClick={() => {
                set_window_index(idx);
                setSelectedWindower(windowers[idx]);
              }}
            >
              {n.name}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <HyperparameterView
        handleHyperparameterChange={onParameterChanged}
        isAdvanced={false}
        hyperparameters={windowers[window_index].parameters}
      ></HyperparameterView>
    </Fragment>
  );
};

Select_Windowing.validate = ({ selectedWindowing }) => {
  if (!selectedWindowing) {
    return 'You need to select a windowing';
  }
};

export default Select_Windowing;
