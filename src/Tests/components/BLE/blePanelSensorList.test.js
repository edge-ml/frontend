import BlePanelSensorList from '../../../components/BLE/BlePanelSensorList';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeOnChangeSampleRate = jest.fn();
const fakeOnToggleSensor = jest.fn();
const event_change_samplerate = {
  target: {
    value: '20',
  },
};
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

it('Render component when disabled', () => {
  const wrapper = shallow(<BlePanelSensorList></BlePanelSensorList>);
  expect(wrapper.html()).toBe(null);
});

it('Sensor list', () => {
  const wrapper = shallow(
    <BlePanelSensorList
      maxSampleRate={15}
      selectedSensors={fakeSelectedSensors}
      onChangeSampleRate={fakeOnChangeSampleRate}
      sensors={fakeDeviceSensors}
      onToggleSensor={fakeOnToggleSensor}
      disabled={false}
    ></BlePanelSensorList>
  );

  // sample rate sum too high
  expect(
    wrapper.containsMatchingElement(<strong>Warning: </strong>)
  ).toBeTruthy();

  // table row for every device sensor
  for (const [key, value] of Object.entries(fakeDeviceSensors)) {
    expect(wrapper.containsMatchingElement(<td>{value.name}</td>)).toBeTruthy();
  }

  // tick checkbox to select/deselect sensor
  wrapper.find('Input').first().simulate('change');
  expect(fakeOnToggleSensor).toBeCalledWith('4');

  // change sample rate with user input
  wrapper.find('Input').at(1).simulate('change', event_change_samplerate);
  expect(fakeOnChangeSampleRate).toHaveBeenCalledWith('4', '20');
});

it('sensor list overall sample rate acceptable', () => {
  const wrapper = shallow(
    <BlePanelSensorList
      maxSampleRate={50}
      selectedSensors={fakeSelectedSensors}
      sensors={fakeDeviceSensors}
      disabled={true}
    ></BlePanelSensorList>
  );
  expect(wrapper.containsMatchingElement(<strong>Warning: </strong>)).toBe(
    false
  );
});
