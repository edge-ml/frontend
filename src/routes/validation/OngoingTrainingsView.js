import React from 'react';
import { Table } from 'reactstrap';
import { TrainingStateCounter } from './TrainingStateCounter';

export const OngoingTrainingsView = ({ trainings }) => (
  <div>
    {trainings.map(t => (
      <div className="d-flex justify-content-between flex-row">
        <span>{t.name}</span>
        <TrainingStateCounter training={t} />
      </div>
    ))}
  </div>
);
