import { Badge, Container, Card, CardBody, CardHeader } from 'reactstrap';
import classNames from 'classnames';

import './index.css';

const TSSelectionPanel = (props) => {
  const { timeSeries, activeSeries, onClickSelectSeries } = props;
  return (
    <div className="sidepanel-card">
      <div className="sidepanel-heading">
        <h5>
          <b>Select Series</b>
        </h5>
      </div>
      <div className="scrollView sidepanel-content">
        <div class="tslist">
          {timeSeries.map((ts) => (
            <Badge
              onClick={() => onClickSelectSeries(ts._id)}
              className={
                activeSeries.includes(ts._id)
                  ? 'badgeActive badge'
                  : 'badgeInactive badge'
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
