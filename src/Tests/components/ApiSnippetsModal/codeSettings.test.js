import CodeSettings from '../../../components/ApiSnippetsModal/CodeSettings';
import { shallow, configure } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakePlatform = 'Arduino';
const fakeOnPlatformChange = jest.fn();
const fakeOnServerTimeChange = jest.fn();

it('Change platform for generated code snippet', () => {
  const wrapper = shallow(
    <CodeSettings
      platform={fakePlatform}
      servertime={true}
      onPlatformChange={fakeOnPlatformChange}
      onServerTimeChange={fakeOnServerTimeChange}
    />
  );
  wrapper.find('Input').first().simulate('change');
  expect(fakeOnPlatformChange).toHaveBeenCalled();
});

it('Change use of device time', () => {
  const wrapper = shallow(
    <CodeSettings
      platform={fakePlatform}
      servertime={false}
      onPlatformChange={fakeOnPlatformChange}
      onServerTimeChange={fakeOnServerTimeChange}
    />
  );
  wrapper.find('Input').at(5).simulate('change');
  expect(fakeOnServerTimeChange).toHaveBeenCalled();
});
