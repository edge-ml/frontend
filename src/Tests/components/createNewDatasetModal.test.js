import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { mount, render } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CreateNewDatasetModal from '../../components/CreateNewDatasetModal/CreateNewDatasetModal';
import { createDataset } from '../../services/ApiServices/DatasetServices';
import { fakeDataset_One } from '../fakeData/fakeDatasets';
import {
  processCSV,
  generateTimeSeries,
  calculateStartEndTimes
} from '../../services/CsvService';
import { readFakeCsvFile } from '../testUtils';

configure({ adapter: new Adapter() });
const csv_dataset_1 = __dirname + '/fakeData/fakeDataSets/testData.csv';
const csv_dataset_2 = __dirname + '/fakeData/fakeDataSets/testData2.csv';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('Sucess cases', () => {
  it('Upload single csv file without labels', async () => {
    const wrapper = mount(
      <CreateNewDatasetModal isOpen={true}></CreateNewDatasetModal>
    );
    const file = readFakeCsvFile('noLabels.csv');
    wrapper.instance().onFileInput([file]);
    await flushPromises();
    wrapper.update();
    expect(
      wrapper
        .find('#datasetName0')
        .first()
        .props().value
    ).toEqual(file.name.replace('.csv', ''));
    expect(
      wrapper
        .find('#nameInput00')
        .first()
        .props().value
    ).toEqual('accX');
    expect(
      wrapper
        .find('#nameInput01')
        .first()
        .props().value
    ).toEqual('accY');
    expect(
      wrapper
        .find('#nameInput02')
        .first()
        .props().value
    ).toEqual('accZ');
  });

  it('Upload single file with labels', async () => {
    const wrapper = mount(
      <CreateNewDatasetModal isOpen={true}></CreateNewDatasetModal>
    );
    const file = readFakeCsvFile('full_feature_working.csv');
    wrapper.instance().onFileInput([file]);
    await flushPromises();
    wrapper.update();
    expect(
      wrapper
        .find('#datasetName0')
        .first()
        .props().value
    ).toEqual(file.name.replace('.csv', ''));
    expect(
      wrapper
        .find('#nameInput00')
        .first()
        .props().value
    ).toEqual('accX');
    expect(
      wrapper
        .find('#nameInput01')
        .first()
        .props().value
    ).toEqual('accY');
    expect(
      wrapper
        .find('#nameInput02')
        .first()
        .props().value
    ).toEqual('accZ');
    expect(
      wrapper
        .find('#labelName0')
        .first()
        .text()
    ).toEqual('labeling1');
  });
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
function tick() {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}
