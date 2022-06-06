import BlePanelConnectDevice from '../../../components/BLE/BlePanelConnectDevice';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const connectedBLEDevice = {
  name: 'Nicla',
};

it('Render panel', () => {
  const wrapper = shallow(<BlePanelConnectDevice></BlePanelConnectDevice>);
  expect(wrapper.html()).not.toBe('');
});

it('display not connected state', () => {
  const wrapper = shallow(
    <BlePanelConnectDevice
      connectedBLEDevice={undefined}
    ></BlePanelConnectDevice>
  );
  expect(
    wrapper.containsMatchingElement(<div>No device connected</div>)
  ).toBeTruthy();
});

it('display connection state', () => {
  const fakeToggleBLEDeviceConnection = jest.fn();
  const wrapper = shallow(
    <BlePanelConnectDevice
      bleConnectionChanging={false}
      toggleBLEDeviceConnection={fakeToggleBLEDeviceConnection}
      connectedBLEDevice={connectedBLEDevice}
    ></BlePanelConnectDevice>
  );
  expect(wrapper.containsMatchingElement(<b>Nicla</b>)).toBeTruthy();
  wrapper.find('SpinnerButton').simulate('click');
  expect(fakeToggleBLEDeviceConnection).toHaveBeenCalledTimes(1);
});
