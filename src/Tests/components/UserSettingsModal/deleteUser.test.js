import DeleteUser from '../../../components/UserSettingsModal/DeleteUser';
import { shallow, mount, configure } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeDeleteUser = jest.fn();
const fakeUserMail = 'test@teco.edu';

const event_correctmail = {
  target: {
    value: fakeUserMail,
  },
};

const event_wrongmail = {
  target: {
    value: 'test1@teco.edu',
  },
};

it('Render Delete User Confirmation Window', () => {
  const wrapper = shallow(<DeleteUser userMail={fakeUserMail}></DeleteUser>);
  expect(wrapper.containsMatchingElement({ fakeUserMail })).toBeTruthy();
});

it('Delete User with correct Confirmation Mail', () => {
  const wrapper = shallow(
    <DeleteUser
      userMail={fakeUserMail}
      deleteUser={fakeDeleteUser}
    ></DeleteUser>
  );
  wrapper.find('Input').simulate('change', event_correctmail);
  expect(wrapper.state().confirmationMail).toBe(fakeUserMail);
  wrapper.find('Button').simulate('click');
  expect(fakeDeleteUser).toHaveBeenCalledWith(fakeUserMail);
});

it('Delete User with wrong Confirmation Mail', () => {
  const wrapper = mount(
    <DeleteUser
      userMail={fakeUserMail}
      deleteUser={fakeDeleteUser}
    ></DeleteUser>
  );
  wrapper.find('Input').simulate('change', event_wrongmail);
  wrapper.find('Button').simulate('click');
  expect(fakeDeleteUser).not.toHaveBeenCalled();
});
