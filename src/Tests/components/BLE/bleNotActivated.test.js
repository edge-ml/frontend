import BleNotActivated from '../../../components/BLE/BleNotActivated';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Render page', () => {
  const wrapper = mount(<BleNotActivated></BleNotActivated>);
  expect(wrapper.html()).not.toBe('');
});
