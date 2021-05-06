import HelpModal from '../../../components/ManagementPanel/HelpModal';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import ReactDOM from 'react-dom';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Render page', async () => {
  const root = document.createElement('div');
  const wrapper = mount(<HelpModal isOpen={true}></HelpModal>, root);
  await flushPromises();
  expect(wrapper.html()).not.toBe('');
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
