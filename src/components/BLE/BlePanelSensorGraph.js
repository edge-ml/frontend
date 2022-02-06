import React, { Component } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

class BlePanelSensorGraph extends Component {
  constructor(props) {
    super(props);
    this.updateLiveData = this.updateLiveData.bind(this);
    this.handleStartLiveUpdate = this.handleStartLiveUpdate.bind(this);
    this.handleStopLiveUpdate = this.handleStopLiveUpdate.bind(this);
    this.length = this.props.components.length;
    const now = Date.now();
    this.state =
      this.length === 3
        ? {
            data1: this.createStartData(now),
            data2: this.createStartData(now),
            data3: this.createStartData(now),
            liveUpdate: false
          }
        : {
            data1: this.createStartData(now),
            liveUpdate: false
          };
  }

  createStartData = (time, magnitude, points = 100) => {
    const data = [];
    let i = points * -1 + 1;
    for (i; i <= 0; i++) {
      data.push(this.createDataPoint(time, magnitude, i));
    }
    return data;
  };

  createDataPoint = (time, magnitude = 300, offset = 0) => {
    return [time + offset * magnitude, 0];
  };

  addDataPoint = (data, toAdd) => {
    const newData = data.slice(); // Clone
    newData.shift();
    newData.push(toAdd);
    return newData;
  };

  componentDidMount() {
    //this.handleStartLiveUpdate();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.recorderState === 'startup' &&
      this.props.recorderState === 'recording'
    ) {
      this.handleStartLiveUpdate();
    }
  }

  componentWillUnmount() {
    //this.handleStopLiveUpdate();
    console.log('unmounted');
    window.clearInterval(this.state.liveUpdate);
  }

  updateLiveData() {
    if (Array.isArray(this.props.value)) {
      this.setState({
        data1: this.addDataPoint(this.state.data1, [
          Date.now(),
          this.props.value[0]
        ])
      });
      console.log(this.state.data1);
      if (this.length === 3) {
        this.setState({
          data2: this.addDataPoint(this.state.data2, [
            Date.now(),
            this.props.value[1]
          ]),
          data3: this.addDataPoint(this.state.data3, [
            Date.now(),
            this.props.value[2]
          ])
        });
      }
    }

    if (this.props.recorderState === 'finalizing') {
      window.clearInterval(this.state.liveUpdate);
      const now = Date.now();
      this.setState({
        data1: this.createStartData(now),
        liveUpdate: false
      });
      if (this.length === 3) {
        this.setState({
          data2: this.createStartData(now),
          data3: this.createStartData(now)
        });
      }
    }
  }

  handleStartLiveUpdate(e) {
    e && e.preventDefault();
    this.setState({
      liveUpdate: window.setInterval(this.updateLiveData, 300)
    });
  }

  handleStopLiveUpdate(e) {
    e && e.preventDefault();
    window.clearInterval(this.state.liveUpdate);
    this.setState({
      liveUpdate: false
    });
  }

  render() {
    let var_series =
      this.length === 3
        ? [
            { name: this.props.components[0], data: this.state.data1 },
            { name: this.props.components[1], data: this.state.data2 },
            { name: this.props.components[2], data: this.state.data3 }
          ]
        : [{ name: this.props.components[0], data: this.state.data1 }];

    let options = {
      series: var_series,
      title: {
        text: this.props.name
      },
      oneToOne: true,
      xAxis: {
        labels: {
          enabled: false
        }
      },
      yAxis: {
        title: false,
        labels: {
          enabled: true
        }
      }
    };

    return (
      <div>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          updateArgs={[true]}
        />
      </div>
    );
  }
}

export default BlePanelSensorGraph;
