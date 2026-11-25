import { intersect } from "../../services/helpers";

// What a training request is built from, kept free of React so it can be
// tested on its own.

// Recordings a model can learn from: audio files, and videos with a sound
// track, once the dataset-store has finished reading them.
export const soundRecordings = (dataset) =>
  (dataset?.mediaSeries ?? []).filter(
    (m) =>
      (m.kind === "audio" || Boolean(m.meta?.audioCodec)) &&
      (m.status ?? "ready") === "ready"
  );

const namesIn = (selected, list) =>
  selected.length
    ? intersect(...selected.map((d) => [...new Set(list(d).map((x) => x.name))]))
    : [];

// Time series every selected dataset has.
export const commonTimeSeriesNames = (selected) =>
  namesIn(selected, (d) => d.timeSeries ?? []);

// Recording names every selected dataset has a sound recording of. A model
// takes one sound input, so recordings are chosen by name, like time series.
export const commonRecordingNames = (selected) =>
  namesIn(selected, soundRecordings);

// Sound recordings left out because some selected dataset lacks them.
export const partialRecordingNames = (selected) => {
  const common = commonRecordingNames(selected);
  return [
    ...new Set(selected.flatMap((d) => soundRecordings(d).map((m) => m.name))),
  ].filter((name) => !common.includes(name));
};

// The recording to start with: the only one, or none when there is a choice.
export const defaultRecordingName = (selected) => {
  const names = commonRecordingNames(selected);
  return names.length === 1 ? names[0] : undefined;
};

export const buildTrainRequest = ({
  datasets,
  disabledTimeseriesNames,
  recordingName,
  usesRecordings,
  labeling,
  zeroClass,
  selectedPipeline,
  selectedPipelineSteps,
  modelName,
}) => {
  const selected = datasets.filter((d) => d.selected);
  const tsNames = commonTimeSeriesNames(selected);
  return {
    datasets: selected
      .map((d) => {
        const entry = {
          _id: d._id,
          timeSeries: d.timeSeries
            .filter(
              (ts) =>
                tsNames.includes(ts.name) &&
                !disabledTimeseriesNames.includes(ts.name)
            )
            .map((ts) => ts._id),
        };
        if (usesRecordings) {
          const recording = recordingName
            ? soundRecordings(d).find((m) => m.name === recordingName)
            : undefined;
          entry.mediaSeries = recording ? [recording._id] : [];
        }
        return entry;
      })
      // a dataset has to give the model something; with recordings, sound alone is enough
      .filter((d) => d.timeSeries.length > 0 || d.mediaSeries?.length > 0),
    labeling: {
      _id: labeling._id,
      useZeroClass: zeroClass,
      disabledLabelIDs: labeling.disabledLabels || [],
    },
    selectedPipeline: {
      ...selectedPipeline,
      steps: selectedPipeline.steps.map((step, i) => ({
        ...step,
        options: selectedPipelineSteps[i],
      })),
    },
    name: modelName,
  };
};
