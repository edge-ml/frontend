import Snackbar from '../../components/Snackbar/Snackbar';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeText = 'information text';
const fakeCloseSnackbar = jest.fn();

it('Render page', () => {
  const wrapper = shallow(<Snackbar></Snackbar>);
  expect(wrapper.html()).not.toBe('');
});

it('Display text', () => {
  const wrapper = shallow(<Snackbar text={fakeText}></Snackbar>);
  expect(wrapper.containsMatchingElement(<div>{fakeText}</div>)).toBe(true);
});

it('Close snackbar', () => {
  const wrapper = shallow(
    <Snackbar text={fakeText} closeSnackbar={fakeCloseSnackbar}></Snackbar>
  );
  wrapper.find('Card').simulate('click', {
    preventDefault: () => {},
  });
  expect(fakeCloseSnackbar).toHaveBeenCalledTimes(1);
});
