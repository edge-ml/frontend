import UserSettingsModal from '../../../components/UserSettingsModal/UserSettingsModal';
import { mount, configure, shallow } from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';
import Adapter from 'enzyme-adapter-react-16';
import { init2FA } from '../../../services/ApiServices/AuthentificationServices';

configure({ adapter: new Adapter() });
jest.mock('../../../services/ApiServices/AuthentificationServices');

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Render page', () => {
  it('Render page with modal closed', () => {
    const wrapper = shallow(<UserSettingsModal></UserSettingsModal>);
    expect(wrapper.html()).toBe('');
  });

  it('Render page with modal open', () => {
    const wrapper = shallow(
      <UserSettingsModal isOpen={true}></UserSettingsModal>
    );
    expect(wrapper.isEmptyRender()).toBe(false);
  });
});

describe('Click though tabs', () => {
  it('Click on logoutSettings', () => {
    const wrapper = mount(
      <UserSettingsModal isOpen={true}></UserSettingsModal>
    );
    wrapper
      .find('.nav-link')
      .at(0)
      .simulate('click');
    expect(wrapper.find('#logoutSettings').exists()).toBe(true);
  });
  it('Click on passwordSettings', () => {
    const wrapper = mount(
      <UserSettingsModal isOpen={true}></UserSettingsModal>
    );
    wrapper
      .find('.nav-link')
      .at(2)
      .simulate('click');
    expect(wrapper.find('#passwordSettings').exists()).toBe(true);
  });

  it('Click on twoFaSettings', () => {
    init2FA.mockReturnValue(Promise.resolve(undefined));
    const wrapper = mount(
      <UserSettingsModal isOpen={true}></UserSettingsModal>
    );
    wrapper
      .find('.nav-link')
      .at(3)
      .simulate('click');
    expect(wrapper.find('#twoFaSettings').exists()).toBe(true);
  });

  it('Click on change username', () => {
    const wrapper = mount(
      <UserSettingsModal isOpen={true}></UserSettingsModal>
    );
    wrapper
      .find('.nav-link')
      .at(4)
      .simulate('click');
    expect(wrapper.find('#userNameSettings').exists()).toBe(true);
  });

  it('Click on twoFaSettings, then on mailSettings', () => {
    init2FA.mockReturnValue(Promise.resolve(undefined));
    const wrapper = mount(
      <UserSettingsModal isOpen={true}></UserSettingsModal>
    );
    wrapper
      .find('.nav-link')
      .at(3)
      .simulate('click');
    expect(wrapper.find('#twoFaSettings').exists()).toBe(true);
    wrapper
      .find('.nav-link')
      .at(1)
      .simulate('click');
    expect(wrapper.find('#mailSettings').exists()).toBe(true);
  });
});
