import { Button } from 'reactstrap';
import { hexToForegroundColor } from '../../services/ColorService';

import './LabelingPanel.css';

const LabelButtonView = ({
  labeling,
  selectedLabelTypeId,
  canEdit,
  handleLabelTypeClicked,
}) => {
  return (
    <div>
      {labeling.labels.map((label, index) => (
        <Button
          className="m-1 labelingButton"
          disabled={selectedLabelTypeId === undefined || !canEdit}
          style={{
            backgroundColor:
              label._id === selectedLabelTypeId ? label.color : 'white',
            borderColor: label._id === selectedLabelTypeId ? null : label.color,
            color:
              label._id === selectedLabelTypeId
                ? hexToForegroundColor(label.color)
                : label.color,
          }}
          onClick={(e) => handleLabelTypeClicked(e, label._id)}
          key={index}
        >
          {label.name} {'(' + (index + 1) + ')'}
        </Button>
      ))}
    </div>
  );
};

const TimeDisplay = ({ from, to }) => {
  return (
    <div className="mx-2">
      <small>
        <div className="d-flex justify-content-center font-weight-bold">
          Selected Label
        </div>
      </small>
      <div className="d-flex align-items-center">
        <small>
          <div className="monospace text-sm">
            {new Date(from).toUTCString().split(' ')[4]}
          </div>
        </small>
        <small>
          <div className="mx-1 monospace">-</div>
        </small>
        <small>
          <div className="monospace">
            {new Date(to).toUTCString().split(' ')[4]}
          </div>
        </small>
      </div>
    </div>
  );
};

const LabelingPanel = ({
  labeling,
  onSelectedLabelTypeIdChanged,
  hideLabels,
  selectedLabelTypeId,
  canEdit,
  onAddLabel,
  from,
  to,
  onDeleteSelectedLabel,
  selectedLabelId,
}) => {
  const handleLabelTypeClicked = (e, id) => {
    e.preventDefault();
    onSelectedLabelTypeIdChanged(id);
  };

  console.log(selectedLabelTypeId);
  return (
    <div>
      <div className="labelingPanelBorder"></div>
      <div className="d-flex justify-content-between p-1">
        {!hideLabels ? (
          <div className="d-flex">
            <Button
              className="labelingButton m-1 mr-2"
              color="secondary"
              onClick={onAddLabel}
            >
              + Add Label
            </Button>
            <LabelButtonView
              labeling={labeling}
              selectedLabelTypeId={selectedLabelTypeId}
              handleLabelTypeClicked={handleLabelTypeClicked}
              canEdit={canEdit}
            ></LabelButtonView>
          </div>
        ) : (
          <div></div>
        )}
        <div className="d-flex">
          <TimeDisplay from={from} to={to}></TimeDisplay>
          <Button
            disabled={selectedLabelId === undefined || !canEdit}
            className="deleteButton m-1"
            outline
            color="danger"
            onClick={onDeleteSelectedLabel}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LabelingPanel;
