import React from 'react';
import { Spinner, Badge } from 'reactstrap';
import {
  faCheck,
  faHourglass,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const states = Object.entries({
  TRAINING_INITIATED: 'Training initiated',
  FEATURE_EXTRACTION: 'Feature extraction',
  MODEL_TRAINING: 'Classifier fit',
  TRAINING_SUCCESSFUL: 'Training successful',
  TRAINING_FAILED: 'Training failed',
});

const BS_SUCCESS = '#28a745'; // TODO: find a better way
const BS_SECONDARY = '#6c757d';
const BS_FAILURE = '#df4759';

export const TrainingStateCounter = ({
  training: { training_state, error_msg },
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
      }}
    >
      {training_state !== 'TRAINING_FAILED' &&
        states.map(([k, v], i) => {
          const color =
            training_state === k
              ? 'info'
              : i <= states.findIndex((x) => x[0] === training_state)
              ? 'success'
              : 'secondary';
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {training_state === k ? (
                <Spinner color="info" size="sm" />
              ) : i <= states.findIndex((x) => x[0] === training_state) ? (
                <FontAwesomeIcon style={{ color: BS_SUCCESS }} icon={faCheck} />
              ) : (
                <FontAwesomeIcon
                  style={{ color: BS_SECONDARY }}
                  icon={faHourglass}
                />
              )}{' '}
              <Badge color={color}>{v}</Badge>
            </div>
          );
        })}
      {training_state === 'TRAINING_FAILED' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <FontAwesomeIcon
            style={{ color: BS_FAILURE }}
            icon={faExclamationTriangle}
          />{' '}
          <Badge color="danger">Training failed: {error_msg}</Badge>
        </div>
      )}
    </div>
  );
};
