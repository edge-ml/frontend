import React from 'react';
import { Badge } from 'reactstrap';
import './index.css';

const TSSelectionPanel = (props) => {
  const { timeSeries, activeSeries, onClickSelectSeries, processedUntil } =
    props;
  return (
    <div className="sidepanel-card">
      <div className="sidepanel-heading">
        <h5>
          <b>Select Series</b>
        </h5>
      </div>
      <div className="scrollView sidepanel-content">
        <div className="tslist">
          {timeSeries.map((ts, idx) => (
            <Badge
              onClick={() => onClickSelectSeries(ts._id)}
              key={`ts-badge-${idx}`}
              className={
                activeSeries.includes(ts._id)
                  ? 'badgeActive badge'
                  : idx < processedUntil
                  ? 'badgeInactive badge'
                  : 'badgeDisabled badge'
              }
            >
              {ts.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TSSelectionPanel;
