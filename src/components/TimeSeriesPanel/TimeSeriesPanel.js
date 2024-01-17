import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import { Fade, Collapse } from 'reactstrap';
import Highcharts from 'highcharts/highstock';
import classNames from 'classnames';

import ChartSettings from './ChartSettings';
import { generateState } from './HighChartsSettings';

const TimeSeriesPanel = (props) => {
  const compontentRef = React.createRef();
  const chart = React.createRef();

  const onMouseDown = (e) => {};

  const isNavigator = props.index === 0;
  const hasData = props.data.length;

  if (!hasData && isNavigator) {
    return null;
  }
  if (!hasData) {
    return <div className="noDataLabel">{props.name}: No data</div>;
  }

  const navigatorOptions = (data) => {
    return {
      height: '100px',
      series: {
        showInLegend: false,
        lineWidth: 1.5,
        enableMouseTracking: false,
        data: data,
      },
      navigator: {
        enabled: false,
      },
      legend: {
        align: 'left',
        verticalAlign: 'center',
        layout: 'vertical',
        x: 45,
        y: 0,
        enabled: false,
      },
      tooltip: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      scrollbar: {
        height: 0,
        buttonArrowColor: '#fff',
      },
      xAxis: {
        lineWidth: 1,
        tickLength: 10,
        labels: {
          enabled: true,
        },
        type: 'datetime',
        ordinal: false,
        crosshair: false,
      },
      yAxis: {
        gridLineWidth: 1,
        labels: {
          enabled: false,
          align: 'left',
          x: 0,
          y: -2,
        },
        title: {
          enabled: false,
        },
        opposite: false,
      },
    };
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={navigatorOptions(props.data)}
        constructorType="stockChart"
        containerProps={{ style: { height: '100%' } }}
      ></HighchartsReact>
    </div>
  );

  return (
    <div style={{ position: 'relative' }} ref={compontentRef}>
      <div
        className={classNames('chartWrapper', {
          'chartWrapper-height': !isNavigator,
        })}
        onMouseDown={onMouseDown}
      >
        {props.index !== 0 ? (
          <div className="font-weight-bold d-flex">
            {props.name + ' (' + (props.unit ? props.unit : 'No unit') + ')'}
            <Fade in={props.unit !== '' && props.unit !== props.unit}></Fade>
          </div>
        ) : null}
        <Collapse
          isOpen={
            props.index !== 0 && (props.scale !== 1 || props.offset !== 0)
          }
        ></Collapse>
        <ChartSettings
          index={props.index}
          unit={props.unit}
          setPopUpOpen={(e) =>
            this.setState({ popupOpen: !this.state.popupOpen })
          }
          handleConfigSave={props.handleConfigSave}
        ></ChartSettings>
        {props.index === 0 && (
          <div className="d-flex align-items-center">
            {/* <div className='cursor-pointer' onClick={() => this.scroll(ScrollDirection.LEFT)}>
                <FontAwesomeIcon icon={faChevronLeft} size='2x'></FontAwesomeIcon>
              </div> */}
            <HighchartsReact
              ref={chart}
              highcharts={Highcharts}
              options={generateState(props).chartOptions}
              oneToOne={true}
              constructorType={'stockChart'}
              containerProps={{ style: { height: '100%' } }}
            />
            {/* <div className='cursor-pointer' onClick={() => this.scroll(ScrollDirection.RIGHT)}>
                <FontAwesomeIcon icon={faChevronRight} size='2x'></FontAwesomeIcon>
              </div> */}
          </div>
        )}
        {props.index !== 0 && (
          <HighchartsReact
            ref={chart}
            highcharts={Highcharts}
            options={generateState(props).chartOptions}
            oneToOne={true}
            constructorType={'stockChart'}
            containerProps={{ style: { height: '100%' } }}
          />
        )}
      </div>
    </div>
  );
};

export default TimeSeriesPanel;
