import React from 'react';
import { mount, shallow } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CustomDropDownMenu from '../../components/CustomDropDownMenu/CustomDropDownMenu';

jest.mock('../../services/ApiServices/DatasetServices');
jest.mock('../../services/CsvService');

configure({ adapter: new Adapter() });

it('render component', () => {
  const wrapper = mount(<CustomDropDownMenu></CustomDropDownMenu>);
  expect(wrapper.html()).not.toEqual('');
});

it('Open menu', () => {
  const wrapper = mount(
    <CustomDropDownMenu content={<div id="contentDiv"></div>}>
      [<div id="testElem1"></div>, <div id="testElem2"></div>]
    </CustomDropDownMenu>
  );
  wrapper.find('#contentDiv').simulate('click');
  expect(wrapper.find('#testElem1').exists()).toBe(true);
});

it('Open menu and click on element', () => {
  const wrapper = mount(
    <CustomDropDownMenu content={<div id="contentDiv"></div>}>
      [<div id="testElem1"></div>, <div id="testElem2"></div>]
    </CustomDropDownMenu>
  );
  wrapper.find('#contentDiv').simulate('click');
  wrapper.find('#testElem2').simulate('click');
  expect(wrapper.find('#testElem1').exists()).toBe(false);
  expect(wrapper.find('#testElem2').exists()).toBe(false);
});

it('Open menu and click on element', () => {
  const map = {};
  document.addEventListener = jest.fn((e, cb) => {
    map[e] = cb;
  });

  const wrapper = mount(
    <CustomDropDownMenu content={<div id="contentDiv"></div>}>
      [<div id="testElem1"></div>, <div id="testElem2"></div>]
    </CustomDropDownMenu>
  );
  wrapper.find('#contentDiv').simulate('click');
  expect(wrapper.find('#testElem1').exists()).toBe(true);
  map.click({ target: document.body, preventDefault() {} });
  wrapper.update();
  expect(wrapper.find('#testElem1').exists()).toBe(false);
});
