import { mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

import ExperimentsPage from '../../../routes/experiments';

import {
  subscribeExperiments,
  updateExperiment
} from '../../../services/ApiServices/ExperimentService';
import { subscribeLabelingsAndLabels } from '../../../services/ApiServices/LabelingServices';
import { fakeExperiment1, fakeLabelingData1 } from './fakeExperimentData';
import EditInstructionModal from '../../../components/EditInstructionModal/EditInstructionModal';
import { updateDataset } from '../../../services/ApiServices/DatasetServices';

jest.mock('../../../services/ApiServices/ExperimentService');
jest.mock('../../../services/ApiServices/DatasetServices');
jest.mock('../../../services/ApiServices/LabelingServices');
jest.mock(
  '../../../components/EditInstructionModal/EditInstructionModal',
  () => ({
    __esModule: true,
    default: jest.fn()
  })
);

configure({ adapter: new Adapter() });

beforeEach(() => {
  EditInstructionModal.mockImplementation(() => null);
});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeHistory = { replace: jest.fn(), push: jest.fn() };

describe('Correct renders without functionality', () => {
  it('Render experiments page without data', async () => {
    subscribeExperiments.mockReturnValue(Promise.resolve([]));
    subscribeLabelingsAndLabels.mockReturnValue(
      Promise.resolve({ labelings: [], labels: [] })
    );
    const fakeLocation = { pathname: '/experiments/new' };
    const wrapper = mount(
      <ExperimentsPage
        location={fakeLocation}
        history={fakeHistory}
      ></ExperimentsPage>
    );
    await flushPromises();
    wrapper.update();
    expect(wrapper.exists('#experimentPageContent')).toBe(true);
  });

  it('Rendering an experiment with data from api', async () => {
    subscribeExperiments.mockReturnValue(Promise.resolve(fakeExperiment1));
    subscribeLabelingsAndLabels.mockReturnValue(
      Promise.resolve(fakeLabelingData1)
    );
    const fakeLocation = { pathname: '/experiments/new' };
    const wrapper = mount(
      <ExperimentsPage
        location={fakeLocation}
        history={fakeHistory}
      ></ExperimentsPage>
    );
    await flushPromises();
    wrapper.update();
    const tabel = wrapper
      .find('#labelTable')
      .first()
      .find('.badge')
      .map(bd => bd.text());
    expect(tabel.includes(fakeLabelingData1.labels[0].name)).toBe(true);
    expect(tabel.includes(fakeLabelingData1.labels[1].name)).toBe(true);
  });
});

describe('Functions on the page work as expected', () => {
  it('Add button opens modal to create new experiment', async () => {
    EditInstructionModal.mockImplementation(() => (
      <div id="fakeEditInstructionModal"></div>
    ));
    subscribeExperiments.mockReturnValue(Promise.resolve([]));
    subscribeLabelingsAndLabels.mockReturnValue(
      Promise.resolve({ labelings: [], labels: [] })
    );
    const fakeLocation = { pathname: '/experiments/new' };
    const wrapper = mount(
      <ExperimentsPage
        location={fakeLocation}
        history={fakeHistory}
      ></ExperimentsPage>
    );
    await flushPromises();
    wrapper.update();
    wrapper
      .find('#btnAddExperiment')
      .first()
      .simulate('click');
    expect(wrapper.exists('#fakeEditInstructionModal')).toEqual(true);
  });

  // Not working jet
  it.skip('Update dataset with modal', async () => {
    const exp = { ...fakeExperiment1[0] };
    exp.name = 'newExperimentName';
    /*EditInstructionModal.mockImplementation((props) => {
      return <div id="mockOnSave" onClick={props.onSave(fakeExperiment1[0])}></div>;
    });*/

    global.URLSearchParams = jest.fn(x => ({
      get: jest.fn(() => fakeExperiment1._id)
    }));

    subscribeExperiments.mockReturnValue(Promise.resolve(fakeExperiment1));
    subscribeLabelingsAndLabels.mockReturnValue(
      Promise.resolve({
        labelings: fakeLabelingData1.labelings,
        labels: fakeLabelingData1.labels
      })
    );
    updateExperiment.mockReturnValue(Promise.resolve(fakeExperiment1));
    const fakeLocation = { pathname: '/experiments/new' };
    const wrapper = mount(
      <ExperimentsPage
        location={fakeLocation}
        history={fakeHistory}
      ></ExperimentsPage>
    );
    await flushPromises();
    wrapper.update();
    await flushPromises();
    wrapper.update();
    console.log(wrapper.html());
    expect(wrapper.exists('#fakeEditInstructionModal')).toEqual(true);
    expect(updateDataset).toBeCalledWith(exp);
  });
});
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
