// Leave-one-out cross validation splits on a dataset metadata field. Which
// fields exist is project specific, so ml declares the `group_field` parameter
// with no options and they are derived here from the datasets the user selected.
//
// ml enforces the same rules and refuses the run, so the wording produced here
// matches what it would report.

export const GROUP_FIELD = "group_field";

/**
 * Summarises the metadata fields across the selected datasets.
 *
 * Returns { fields, byField, total } where byField[key] is
 * { datasets, values } — how many selected datasets carry the key, and how many
 * distinct values it takes. Blank values count as absent, because they cannot
 * identify a group.
 */
export const metaFieldSummary = (selectedDatasets = []) => {
  const byField = {};
  selectedDatasets.forEach((dataset) => {
    Object.entries(dataset?.metaData || {}).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      const text = String(value).trim();
      if (text === "") return;
      if (!byField[key]) byField[key] = { datasets: 0, valueSet: new Set() };
      byField[key].datasets += 1;
      byField[key].valueSet.add(text);
    });
  });

  const fields = Object.keys(byField).sort();
  fields.forEach((key) => {
    byField[key].values = byField[key].valueSet.size;
  });

  return { fields, byField, total: selectedDatasets.length };
};

/** Fills the group_field parameter's options with the available field names. */
export const withGroupFieldOptions = (option, fields) => {
  const parameters = option?.parameters;
  if (!parameters || !parameters.some((p) => p.parameter_name === GROUP_FIELD)) {
    return option;
  }
  return {
    ...option,
    parameters: parameters.map((p) =>
      p.parameter_name === GROUP_FIELD ? { ...p, options: fields } : p
    ),
  };
};

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * The warning shown on the evaluation step, or undefined when the step has no
 * group_field (i.e. leave-one-out is not the selected method).
 */
export const groupFieldNote = (option, summary) => {
  const parameter = (option?.parameters || []).find(
    (p) => p.parameter_name === GROUP_FIELD
  );
  if (!parameter) return undefined;

  const { fields, byField, total } = summary;

  if (!fields.length) {
    return `None of the ${plural(
      total,
      "selected dataset"
    )} have metadata fields, so there is nothing to leave out. Add a field such as "subject" to the datasets first.`;
  }

  if (!parameter.value) {
    const available = fields
      .map(
        (f) =>
          `${f} (${plural(byField[f].datasets, "dataset")}, ${plural(
            byField[f].values,
            "value"
          )})`
      )
      .join(", ");
    return `Pick the field to leave out. Available in your selection: ${available}.`;
  }

  const info = byField[parameter.value];
  const withField = info ? info.datasets : 0;
  const distinct = info ? info.values : 0;
  const excluded = total - withField;

  // ml needs at least two distinct values to hold one out against the others.
  if (distinct < 2) {
    return `Only ${plural(
      distinct,
      "distinct value"
    )} of "${parameter.value}" across your selection — leave-one-out needs at least 2, so training would fail.`;
  }

  if (excluded > 0) {
    return `${excluded} of ${total} selected datasets have no "${
      parameter.value
    }" and will be excluded. ${withField} remain, across ${plural(
      distinct,
      "value"
    )}.`;
  }

  return `All ${total} selected datasets have "${parameter.value}", across ${plural(
    distinct,
    "value"
  )}.`;
};
