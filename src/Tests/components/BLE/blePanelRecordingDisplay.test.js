import BlePanelRecordingDisplay from '../../../components/BLE/BlePanelRecordingDisplay';
import BlePanelSensorstreamGraph from '../../../components/BLE/BlePanelSensorstreamGraph';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeSensorKeys = ['4', '13'];
const fakeSelectedSensors = new Set(['4', '13']);
const fakeDeviceSensors = {
  4: {
    sampleRate: 10,
    _id: '62911e608859062c45f47aa3',
    device: '62911e608859062c45f47a85',
    name: 'ACC',
    parseScheme: [
      {
        _id: '6291fb43276f7b53c44dfb7e',
        name: 'x',
        type: 'int16',
        scaleFactor: 1,
      },
      {
        _id: '6291fb43276f7b53c44dfb7f',
        name: 'y',
        type: 'int16',
        scaleFactor: 1,
      },
      {
        _id: '6291fb43276f7b53c44dfb80',
        name: 'z',
        type: 'int16',
        scaleFactor: 1,
      },
    ],
  },

  13: {
    sampleRate: 10,
    _id: '62911e608859062c45f47a91',
    device: '62911e608859062c45f47a85',
    name: 'GYRO',
    parseScheme: [
      {
        _id: '6291fb43276f7b53c44dfb81',
        name: 'x',
        type: 'int16',
        scaleFactor: 1,
      },
      {
        _id: '6291fb43276f7b53c44dfb82',
        name: 'y',
        type: 'int16',
        scaleFactor: 1,
      },
      {
        _id: '6291fb43276f7b53c44dfb83',
        name: 'z',
        type: 'int16',
        scaleFactor: 1,
      },
    ],
  },

  22: {
    sampleRate: 10,
    _id: '62911e608859062c45f47a9d',
    device: '62911e608859062c45f47a85',
    name: 'MAGNET',
    parseScheme: [
      {
        _id: '6291fb43276f7b53c44dfb84',
        name: 'x',
        type: 'int16',
        scaleFactor: 1,
      },
      {
        _id: '6291fb43276f7b53c44dfb85',
        name: 'y',
        type: 'int16',
        scaleFactor: 1,
      },
      {
        _id: '6291fb43276f7b53c44dfb86',
        name: 'z',
        type: 'int16',
        scaleFactor: 1,
      },
    ],
  },
};

it('Render recording display', () => {
  const wrapper = shallow(
    <BlePanelRecordingDisplay
      deviceSensors={fakeDeviceSensors}
      selectedSensors={fakeSelectedSensors}
      sensorKeys={fakeSensorKeys}
    ></BlePanelRecordingDisplay>
  );
  expect(wrapper.html()).not.toBe('');
});

it('One sensorstream graph for every selected sensor', () => {
  const wrapper = shallow(
    <BlePanelRecordingDisplay
      deviceSensors={fakeDeviceSensors}
      selectedSensors={fakeSelectedSensors}
      sensorKeys={fakeSensorKeys}
    ></BlePanelRecordingDisplay>
  );
  fakeSensorKeys.forEach((sensorKey) =>
    expect(
      wrapper.containsMatchingElement(
        <BlePanelSensorstreamGraph
          index={fakeSensorKeys.indexOf(sensorKey.toString())}
        ></BlePanelSensorstreamGraph>
      )
    ).toBeTruthy()
  );
});

it('Get highcharts options for every sensor', () => {
  const spy = jest.spyOn(BlePanelRecordingDisplay.prototype, 'getOptions');
  const wrapper = shallow(
    <BlePanelRecordingDisplay
      deviceSensors={fakeDeviceSensors}
      selectedSensors={fakeSelectedSensors}
      sensorKeys={fakeSensorKeys}
    ></BlePanelRecordingDisplay>
  );
  for (const key of Object.keys(fakeDeviceSensors)) {
    expect(spy).toHaveBeenCalledWith(
      fakeDeviceSensors[key].parseScheme.map((elm) => elm.name),
      fakeDeviceSensors[key].name
    );
  }
  spy.mockClear();
});
