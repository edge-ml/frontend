import {
  InputGroup,
  PopoverHeader,
  Input,
  Popover,
  PopoverBody,
  Button,
  UncontrolledTooltip,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faL,
  faSearchMinus,
  faSearchPlus,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import SpinnerButton from '../Common/SpinnerButton';

const ChartSettings = ({
  index,
  isEmpty,
  setPopUpOpen,
  unit,
  handleConfigSave,
}) => {
  const [isUnitMenuOpen, setUnitMenuOpen] = useState(false);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);
  const [newUnit, setNewUnit] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const toggleUnitMenu = () => {
    setUnitMenuOpen(!isUnitMenuOpen);
    setPopUpOpen();
  };

  if (index === 0 || isEmpty) {
    return null;
  }

  const save = async () => {
    setLoading(true);
    await handleConfigSave(newUnit, scale, offset);
    setLoading(false);
    toggleUnitMenu();
  };

  const unitText = unit || 'no unit';

  return (
    <div className="chartMenuWrapper">
      <button
        className="chartBtn"
        style={{ marginRight: '1px' }}
        key={'unitMenuButton' + index}
        id={'unitMenuButton' + index}
        onClick={toggleUnitMenu}
      >
        <FontAwesomeIcon icon={faCog} size="xs" color="#999999" />
      </button>
      <Popover
        target={'unitMenuButton' + index}
        isOpen={isUnitMenuOpen}
        toggle={toggleUnitMenu}
        trigger="legacy"
      >
        <PopoverHeader className="text-center">
          <strong>Change unit</strong>
        </PopoverHeader>
        <PopoverBody>
          <div>
            <div>
              <strong>1. Provide new unit</strong>
            </div>
            <div>Current unit: {unitText}</div>
            <InputGroup size="sm">
              <div className="input-group-prepend w-35">
                <span className="input-group-text w-100 justify-content-center">
                  New Unit
                </span>
              </div>
              <Input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
              />
            </InputGroup>
            <hr></hr>
            <div>
              <strong>2. Conversion</strong>
            </div>
            <small>
              Tell us how to convert from <strong>{unitText}</strong> to{' '}
              <strong>{newUnit || 'no unit'}</strong>
            </small>
            <div className="my-2 d-flex align-items-center justify-content-center">
              <span>y = (</span>
              <Input
                size="sm mx-1"
                style={{ width: '4em', height: '2em' }}
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              ></Input>
              <span> &times; x) + </span>
              <Input
                size="sm mx-2"
                style={{ width: '4em', height: '2em' }}
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
              ></Input>
            </div>
            <div>
              <div>
                <small>
                  <strong>x</strong>: Old datapoint
                </small>
              </div>
              <div>
                <small>
                  <strong>y</strong>: New datapoint
                </small>
              </div>
            </div>
            <hr></hr>
            <div className="d-flex justify-content-end">
              <SpinnerButton
                size="sm"
                color="primary"
                id="scalingSaveButton"
                onClick={save}
                loading={loading}
                loadingtext="Processing"
              >
                Save
              </SpinnerButton>
            </div>
          </div>
        </PopoverBody>
      </Popover>
      {/* <button
        className="chartBtn"
        style={{ marginRight: '1px' }}
        // onClick={(e) => this.zoom(ZoomDirection.OUT)}
        key={'zoomOutButton' + index}
      >
        <FontAwesomeIcon icon={faSearchMinus} size="xs" color="#999999" />
      </button>
      <button
        className="chartBtn"
        // onClick={(e) => this.zoom(ZoomDirection.IN)}
        key={'zoomInButton' + index}
      >
        <FontAwesomeIcon icon={faSearchPlus} size="xs" color="#999999" />
      </button> */}
    </div>
  );
};

export default ChartSettings;
