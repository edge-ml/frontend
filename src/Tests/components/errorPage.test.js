import ErrorPage from '../../components/ErrorPage/ErrorPage';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Render error page', () => {
  const wrapper = shallow(
    <ErrorPage
      required={true}
      match={{ params: { id: 1 }, isExact: true, path: '', url: '' }}
    />
  );
  expect(wrapper.html()).not.toBe('');
});

it('Display error text', () => {
  const wrapper = shallow(
    <ErrorPage
      required={true}
      match={{
        params: { id: 1, errorText: 'error text' },
        isExact: true,
        path: '',
        url: '',
      }}
    />
  );
  expect(wrapper.containsMatchingElement(<h2>error text</h2>)).toBeTruthy();
});
