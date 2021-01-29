import TwoFaSettings from '../../../components/UserSettingsModal/TwoFaSettings';
import { mount, configure, shallow } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import {
  reset2FA,
  init2FA,
  verify2FA
} from '../../../services/ApiServices/AuthentificationServices';

configure({ adapter: new Adapter() });
jest.mock('../../../services/ApiServices/AuthentificationServices');

beforeEach(() => {
  global.confirm = () => true;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('TwoFA enabled', () => {
  it('Disable 2FA', async () => {
    init2FA.mockReturnValue(Promise.resolve());
    reset2FA.mockReturnValue(Promise.resolve());
    const fakeLogoutFunc = jest.fn();
    const wrapper = mount(
      <TwoFaSettings
        twoFAEnabled={true}
        onLogout={fakeLogoutFunc}
      ></TwoFaSettings>
    );
    wrapper
      .find('#buttonDisableTwoFA')
      .first()
      .simulate('click');
    await flushPromises();
    expect(reset2FA).toHaveBeenCalledTimes(1);
    expect(fakeLogoutFunc).toHaveBeenCalledTimes(1);
  });

  it('Server rejects TwoFa deactivation', async () => {
    init2FA.mockReturnValue(Promise.resolve());
    reset2FA.mockImplementation(() => Promise.reject({ data: 'ExampleError' }));
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const wrapper = mount(<TwoFaSettings twoFAEnabled={true}></TwoFaSettings>);
    wrapper
      .find('#buttonDisableTwoFA')
      .first()
      .simulate('click');
    await flushPromises();
    expect(window.alert).toBeCalledWith('ExampleError');
  });

  it('User declines TwoFa deactivation confirmation', async () => {
    init2FA.mockReturnValue(Promise.resolve());
    global.confirm = () => false;
    const wrapper = mount(<TwoFaSettings twoFAEnabled={true}></TwoFaSettings>);
    wrapper
      .find('#buttonDisableTwoFA')
      .first()
      .simulate('click');
    await flushPromises();
    expect(reset2FA).not.toHaveBeenCalled();
  });
});

describe('TwoFa not enabled', () => {
  it('Active TwoFA by entering the correct token', async () => {
    init2FA.mockReturnValue(Promise.resolve());
    verify2FA.mockReturnValue(Promise.resolve());
    const fakeEnableTwoFa = jest.fn();
    const wrapper = mount(
      <TwoFaSettings
        twoFAEnabled={false}
        enable2FA={fakeEnableTwoFa}
      ></TwoFaSettings>
    );
    wrapper
      .find('#inputTwoFAToken')
      .first()
      .simulate('change', { target: { value: '123456' } });
    await flushPromises();
    expect(fakeEnableTwoFa).toHaveBeenCalledTimes(1);
  });

  it('Server rejects token', async () => {
    init2FA.mockReturnValue(Promise.resolve());
    verify2FA.mockImplementation(() =>
      Promise.reject({ data: 'ExampleError' })
    );
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const wrapper = mount(<TwoFaSettings twoFAEnabled={false}></TwoFaSettings>);
    wrapper
      .find('#inputTwoFAToken')
      .first()
      .simulate('change', { target: { value: '123457' } });
    await flushPromises();
    expect(window.alert).toHaveBeenCalledWith('ExampleError');
  });

  it('Token with length unequal to 6 does not change anything', async () => {
    init2FA.mockReturnValue(Promise.resolve());
    verify2FA.mockImplementation(() =>
      Promise.reject({ data: 'ExampleError' })
    );
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const wrapper = mount(<TwoFaSettings twoFAEnabled={false}></TwoFaSettings>);
    wrapper
      .find('#inputTwoFAToken')
      .first()
      .simulate('change', { target: { value: '123' } });
    await flushPromises();
    expect(verify2FA).not.toHaveBeenCalled();
  });
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
