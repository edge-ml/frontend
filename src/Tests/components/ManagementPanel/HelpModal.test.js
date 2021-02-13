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

it('Render page', () => {
  ReactDOM.createPortal = jest.fn(modal => modal);
  const wrapper = shallow(<HelpModal isOpen={true}></HelpModal>);
  expect(wrapper.html()).not.toBe('');
});
