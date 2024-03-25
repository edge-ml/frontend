import { useState } from 'react';
import LabelBadge from '../../components/Common/LabelBadge';
import { hexToForegroundColor } from '../../services/ColorService';

const LivePage = ({ bleDevice, model }) => {
  const [predictedLabel, setPredictedLabel] = useState(undefined);

  console.log(model);

  const labels = model.labels;

  bleDevice.notify((idx) => {
    console.log(idx);
    setPredictedLabel(labels[idx]);
  });

  return (
    <>
      <div className="m-2">
        <b>Connected to: </b>
        {bleDevice.device.name} <small>({bleDevice.device.id})</small>
      </div>
      <div className="m-2">
        <b>Used labels: </b>
        {labels.map((elm) => (
          <LabelBadge color={elm.color}>{elm.name}</LabelBadge>
        ))}
      </div>
      <hr></hr>
      {predictedLabel ? (
        <div
          className="flex-grow h-100 m-2 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: predictedLabel.color,
            fontWeight: 'bold',
            color: hexToForegroundColor(predictedLabel.color),
            fontSize: '5rem',
          }}
        >
          {predictedLabel.name}
        </div>
      ) : null}
    </>
  );
};

export default LivePage;
