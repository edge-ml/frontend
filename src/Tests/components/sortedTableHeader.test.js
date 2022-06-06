import SortedTableHeader from '../../components/SortedTableHeader/index';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Render component', () => {
  const wrapper = shallow(<SortedTableHeader></SortedTableHeader>);
  expect(wrapper.html()).not.toBe('');
});

it('desc icon', () => {
  const wrapper = shallow(<SortedTableHeader></SortedTableHeader>);
  wrapper.sorted = 'desc';
  expect(
    wrapper.containsMatchingElement(
      <FontAwesomeIcon icon={faCaretDown} className={''} />
    )
  ).toBeTruthy();
});

it('asc icon', () => {
  const wrapper = shallow(<SortedTableHeader></SortedTableHeader>);
  wrapper.sorted = 'asc';
  expect(
    wrapper.containsMatchingElement(
      <FontAwesomeIcon icon={faCaretUp} className={''} />
    )
  ).toBeTruthy();
});
