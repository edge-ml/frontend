import ProjectRefresh from '../../components/ProjectRefresh/ProjectRefresh';
import { shallow, mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { Container } from 'react-bootstrap/lib/Tab';
jest.mock('../../services/ColorService');

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('No children, render nothing', () => {
  const wrapper = shallow(<ProjectRefresh></ProjectRefresh>);
  expect(wrapper.html()).toBe(null);
});

it('Project not present, print project join message', () => {
  const wrapper = shallow(
    <ProjectRefresh>
      <div>testPage</div>
    </ProjectRefresh>
  );
  expect(wrapper.find('NoProjectPage').exists()).toBe(true);
});

it('Project present, render page', () => {
  const wrapper = shallow(
    <ProjectRefresh project={{ _id: 'exampleId' }}>
      <div id="testPage">testPage</div>
    </ProjectRefresh>
  );
  expect(wrapper.find('#testPage').exists()).toBe(true);
});

it('Project changes, page reloads', () => {
  const wrapper = shallow(
    <ProjectRefresh project={{ _id: 'exampleId' }}>
      <div id="testPage">testPage</div>
    </ProjectRefresh>
  );
  expect(wrapper.find('#testPage').key()).toEqual('exampleId/.0');
  wrapper.setProps({ project: { _id: 'newTestProject' } });
  expect(wrapper.find('#testPage').key()).toEqual('newTestProject/.0');
});
