import { mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import NoProjectPage from '../../components/NoProjectPage/NoProjectPage';

configure({ adapter: new Adapter() });

beforeEach(() => {});

it('Render standard text', () => {
  const wrapper = mount(<NoProjectPage></NoProjectPage>);
  expect(wrapper.contains('Join or create a project to get started!')).toBe(
    true
  );
});

it('Render custom text', () => {
  const text = 'customTestText';
  const wrapper = mount(<NoProjectPage text={text}></NoProjectPage>);
  expect(wrapper.contains(text)).toBe(true);
});
