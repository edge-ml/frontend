import React, { useState } from 'react';
import { Badge } from 'reactstrap';
import { useInterval } from '../../services/ReactHooksService';
import { getUploadProcessingProgress } from '../../services/ApiServices/DatasetServices';
import './index.css';

const TSSelectionPanel = (props) => {
  const { timeSeries, activeSeries, onClickSelectSeries, datasetId } = props;
  const [processedUntil, setProcessedUntil] = useState(0);
  const [consecutiveNoUpdateCount, setConsecutiveNoUpdateCount] = useState(0);
  const MAXIMUM_POLLING_INTERVAL = 60 * 1000; // 60 seconds

  useInterval(async () => {
    const [step, progress, currentTimeseries = 0, totalTimeseries = undefined] = await getUploadProcessingProgress(datasetId);
    if (progress === 100) {
      setProcessedUntil(timeSeries.length);
      setConsecutiveNoUpdateCount(null); // stop polling
    } else if (currentTimeseries !== processedUntil) {
      setProcessedUntil(currentTimeseries);
      setConsecutiveNoUpdateCount(prevCount => prevCount + 1);
    } else {
      setConsecutiveNoUpdateCount(0);
    }
  }, consecutiveNoUpdateCount === null 
      ? null
      :  Math.min(MAXIMUM_POLLING_INTERVAL, (1.5 ** consecutiveNoUpdateCount) * 1000 + Math.random() * 100))

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
