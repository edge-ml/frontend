import { Badge, Container, Card, CardBody, CardHeader } from 'reactstrap';
import classNames from 'classnames';

import './index.css';

const TSSelectionPanel = (props) => {
  const { timeSeries, activeSeries, onClickSelectSeries } = props;
  console.log(timeSeries);
  return (
    <Card>
      <CardHeader>
        <b>Select Series</b>
      </CardHeader>
      <CardBody>
        <div className="scrollView">
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
      </CardBody>
    </Card>
  );
};

export default TSSelectionPanel;
