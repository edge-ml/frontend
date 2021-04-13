import React from "react";
import { mount, shallow } from "enzyme";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import AutoCompleteInput from "../../components/AutoCompleteInput/AutocompleteInput";

jest.mock("../../services/ApiServices/DatasetServices");
jest.mock("../../services/CsvService");

configure({ adapter: new Adapter() });

function options() {
  return new Promise((resolve, reject) => {
    resolve(["Option1", "Option2", "Oeption3"]);
  });
}

it("render component", () => {
  const wrapper = mount(
    <AutoCompleteInput getSuggestions={options}></AutoCompleteInput>
  );
  expect(wrapper.html()).not.toEqual("");
});

it("Putting in one letter and get suggestions", async () => {
  const onChange = jest.fn();
  const wrapper = mount(
    <AutoCompleteInput
      getSuggestions={options}
      onChange={onChange}
    ></AutoCompleteInput>
  );
  wrapper
    .find("#autoCompleteInput")
    .first()
    .simulate("change", { target: { value: "O" } });
  await flushPromises();
  expect(wrapper.text().includes("Option1"));
  expect(wrapper.text().includes("Option2"));
  expect(wrapper.text().includes("Oeption3"));
});

it("Click on one suggestion", async () => {
  const onChange = jest.fn();
  const wrapper = mount(
    <AutoCompleteInput
      getSuggestions={options}
      onChange={onChange}
    ></AutoCompleteInput>
  );
  wrapper
    .find("#autoCompleteInput")
    .first()
    .simulate("change", { target: { value: "O" } });
  await flushPromises();
  wrapper.update();
  wrapper.find("#Option1").simulate("click");
  await flushPromises();
  wrapper.update();
  expect(onChange).toHaveBeenCalled();
  wrapper.setProps({ value: "Option1" });
  expect(
    wrapper
      .find("#autoCompleteInput")
      .first()
      .props().value
  ).toBe("Option1");
});

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}
