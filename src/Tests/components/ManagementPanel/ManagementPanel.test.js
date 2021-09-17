import ManagementPanel from '../../../components/ManagementPanel/ManagementPanel';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import ReactDOM from 'react-dom';
import { fakeDataset_One, fakeLabeling_One } from '../../fakeData/fakeDatasets';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Render page', () => {
  const root = document.createElement('div');
  const wrapper = mount(<ManagementPanel></ManagementPanel>, root);
  expect(wrapper.html()).not.toBe('');
});

it('Click on button to Upload CSV-file', () => {
  ReactDOM.createPortal = jest.fn(modal => modal);
  const fakeSetModalOpen = jest.fn();
  const wrapper = shallow(
    <ManagementPanel setModalOpen={fakeSetModalOpen}></ManagementPanel>
  );
  wrapper.find('#buttonUploadCSV').simulate('click');
  expect(wrapper.find('CreateNewDatasetModal').exists()).toBe(true);
});

it('Click on button to open HelpModal', () => {
  ReactDOM.createPortal = jest.fn(modal => modal);
  const wrapper = shallow(<ManagementPanel></ManagementPanel>);
  wrapper.find('#buttonOpenHelpModal').simulate('click');
  expect(wrapper.find('HelpModal').exists()).toBe(true);
});

it('Download dataset', () => {
  const dummyElement = document.createElement('div');
  dummyElement.click = jest.fn();
  jest.spyOn(document, 'createElement').mockReturnValueOnce(dummyElement);
  global.URL.createObjectURL = jest.fn();
  global.URL.createObjectURL.mockReturnValue('fakeURL');
  console.log(fakeLabeling_One);
  const wrapper = shallow(
    <ManagementPanel
      dataset={fakeDataset_One}
      labelings={fakeLabeling_One}
    ></ManagementPanel>
  );
  wrapper.find('#buttonDownloadDataset').simulate('click');
  expect(dummyElement.click).toHaveBeenCalled();
});

it('Delete Dataset and user confirms', () => {
  global.confirm = () => true;
  const fakeOnDeleteDataset = jest.fn();
  const wrapper = shallow(
    <ManagementPanel onDeleteDataset={fakeOnDeleteDataset}></ManagementPanel>
  );
  wrapper.find('#buttonDeleteDataset').simulate('click');
  expect(fakeOnDeleteDataset).toHaveBeenCalledTimes(1);
});

it('Delete Dataset and user does not confirm', () => {
  global.confirm = () => false;
  const fakeOnDeleteDataset = jest.fn();
  const wrapper = shallow(
    <ManagementPanel onDeleteDataset={fakeOnDeleteDataset}></ManagementPanel>
  );
  wrapper.find('#buttonDeleteDataset').simulate('click');
  expect(fakeOnDeleteDataset).toHaveBeenCalledTimes(0);
});
