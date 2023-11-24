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

const ChartSettings = ({ index, isEmpty, handleUnitChange, unit }) => {
  const [isUnitMenuOpen, setUnitMenuOpen] = useState(false);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);
  const [newUnit, setNewUnit] = useState(undefined);

  const toggleUnitMenu = () => {
    setUnitMenuOpen(!isUnitMenuOpen);
  };

  if (index === 0 || isEmpty) {
    return null;
  }

  const unitText = unit || 'no unit';

  return (
    <div className="chartMenuWrapper">
      <button
        className="chartBtn"
        style={{ marginRight: '1px' }}
        key={'unitMenuButton' + index}
        id={'unitMenuButton' + index}
        onClick={(e) => toggleUnitMenu()}
      >
        <FontAwesomeIcon icon={faCog} size="xs" color="#999999" />
      </button>
      <Popover
        target={'unitMenuButton' + index}
        isOpen={isUnitMenuOpen}
        toggle={(e) => toggleUnitMenu()}
        trigger="legacy"
      >
        <PopoverHeader className="text-center">
          <strong>Change unit</strong>
        </PopoverHeader>
        <PopoverBody>
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
            <Button
              size="sm"
              color="primary"
              id="scalingSaveButton"
              onClick={(e) => this.props.handleConfigSave(unit, scale, offset)}
            >
              Save
            </Button>
          </div>
        </PopoverBody>
        {/* <PopoverBody id="scalingConfigMenu">
                    <InputGroup size="sm">
                        <div className="input-group-prepend w-25">
                            <span className="input-group-text w-100 justify-content-center">
                                Unit
                            </span>
                        </div>
                        <Input
                            type="text"
                            value={unit}
                            onChange={(e) =>
                                handleUnitChange(e.target.value)
                            }
                        />
                    </InputGroup>
                    <InputGroup size="sm">
                        <div className="input-group-prepend w-25">
                            <span className="input-group-text w-100 justify-content-center">
                                Scale
                            </span>
                        </div>
                        <Input
                            type="number"
                            value={scale}
                            onChange={(e) =>
                                handleScaleChange(e.target.value)
                            }
                        />
                    </InputGroup>
                    <InputGroup size="sm">
                        <div className="input-group-prepend w-25">
                            <span className="input-group-text w-100 justify-content-center">
                                Offset
                            </span>
                        </div>
                        <Input
                            type="number"
                            value={offset}
                            onChange={(e) =>
                                handleOffsetChange(e.target.value)
                            }
                        />
                    </InputGroup>
                    <div
                        className="d-flex justify-content-end"
                        id="scalingSaveButtonWrapper"
                    >
                        <Button
                            color="primary"
                            id="scalingSaveButton"
                            onClick={(e) =>
                                this.props.handleConfigSave(
                                    unit,
                                    scale,
                                    offset
                                )
                            }
                        >
                            Save
                        </Button>
                        <UncontrolledTooltip
                            target="scalingSaveButton"
                            placement="left"
                            container="scalingConfigMenu"
                            arrowClassName="mr-0 border-white bg-transparent"
                        >
                            Saves the configuration in the database
                        </UncontrolledTooltip>
                    </div>
                </PopoverBody> */}
      </Popover>
      <button
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
      </button>
    </div>
  );
};

export default ChartSettings;
