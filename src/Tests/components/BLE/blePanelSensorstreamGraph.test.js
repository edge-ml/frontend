import BlePanelSensorstreamGraph from '../../../components/BLE/BlePanelSensorstreamGraph';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeIndex = 1;
const fakeSampleRate = 20;
const fakeLastData = [
  [1654349779964, 10],
  [1654349779964, 11],
  [1654349779964, 12],
];
const options = {
  chart: {
    animation: Highcharts.svg,
    marginRight: 10,
  },
  boost: {
    useGPUTranslations: true,
    seriesThreshold: 1,
  },
  series: [
    { name: 'x', data: { x: 1654349779944, y: 0 } },
    { name: 'y', data: { x: 1654349779949, y: 0 } },
    { name: 'z', data: { x: 1654349779954, y: 0 } },
  ],
  title: {
    text: 'Sensor Test Name',
  },
  xAxis: {
    labels: {
      enabled: true,
      rotation: 20,
      overflow: 'allow',
    },
  },
  yAxis: {
    title: false,
    labels: {
      enabled: true,
    },
  },
};

it('Render panel', () => {
  const wrapper = shallow(
    <BlePanelSensorstreamGraph></BlePanelSensorstreamGraph>
  );
  expect(wrapper.html()).not.toBe('');
});

it('Renders a Highcharts chart', () => {
  const wrapper = shallow(
    <BlePanelSensorstreamGraph
      options={options}
      fullSampleRate={false}
      sampleRate={fakeSampleRate}
      lastData={fakeLastData}
      index={fakeIndex}
    ></BlePanelSensorstreamGraph>
  );
  expect(
    wrapper.containsMatchingElement(<HighchartsReact options={options} />)
  ).toBe(true);
});

it('Start live update of sensor stream data', () => {
  jest.useFakeTimers();
  jest.spyOn(global, 'setInterval');
  const wrapper = shallow(
    <BlePanelSensorstreamGraph
      options={options}
      fullSampleRate={false}
      sampleRate={fakeSampleRate}
      lastData={fakeLastData}
      index={fakeIndex}
    ></BlePanelSensorstreamGraph>
  );
  expect(setInterval).toHaveBeenCalledTimes(1);
});

it('Stop live update of sensor stream data', () => {
  const spy = jest.spyOn(
    BlePanelSensorstreamGraph.prototype,
    'handleStopLiveUpdate'
  );
  const wrapper = shallow(
    <BlePanelSensorstreamGraph
      options={options}
      fullSampleRate={true}
      sampleRate={fakeSampleRate}
      lastData={fakeLastData}
      index={fakeIndex}
    ></BlePanelSensorstreamGraph>
  );
  wrapper.instance().componentWillUnmount();
  expect(spy).toHaveBeenCalled();
  spy.mockClear();
});
